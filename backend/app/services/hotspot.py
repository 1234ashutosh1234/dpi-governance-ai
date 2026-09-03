from sqlalchemy.orm import Session
import numpy as np

from sklearn.cluster import DBSCAN

from backend.app.models.citizen_request import CitizenRequestDB


def calculate_hotspot_score(cluster_requests):

    request_count = len(cluster_requests)

    # Request density score
    #
    # 1 request = 20
    # 2 requests = 40
    # 3 requests = 60
    # 4 requests = 80
    # 5+ requests = 100

    demand_score = min(
        request_count * 20,
        100
    )

    # Calculate average AI confidence
    confidence_values = [
        request.confidence or 0
        for request in cluster_requests
    ]

    average_confidence = (
        np.mean(confidence_values)
        if confidence_values
        else 0
    )

    confidence_score = (
        average_confidence * 100
    )

    # Calculate severity score
    #
    # Demand is given more importance
    # than classifier confidence.

    hotspot_score = (
        demand_score * 0.70
        +
        confidence_score * 0.30
    )

    hotspot_score = round(
        float(hotspot_score),
        2
    )

    # Severity level

    if hotspot_score >= 80:

        severity = "Critical"

    elif hotspot_score >= 60:

        severity = "High"

    elif hotspot_score >= 40:

        severity = "Medium"

    else:

        severity = "Low"

    return {
        "hotspot_score": hotspot_score,
        "severity": severity,
        "average_confidence": round(
            float(average_confidence),
            3
        )
    }


def detect_hotspots(
    db: Session,
    district: str
):

    requests = (
        db.query(CitizenRequestDB)
        .filter(
            CitizenRequestDB.district == district
        )
        .filter(
            CitizenRequestDB.latitude.isnot(None)
        )
        .filter(
            CitizenRequestDB.longitude.isnot(None)
        )
        .all()
    )

    if not requests:

        return {
            "district": district,
            "total_requests": 0,
            "total_clusters": 0,
            "clusters": []
        }

    coordinates = np.array([
        [
            request.latitude,
            request.longitude
        ]
        for request in requests
    ])

    clustering = DBSCAN(
        eps=0.01,
        min_samples=2
    )

    labels = clustering.fit_predict(
        coordinates
    )

    clusters = {}

    for request, label in zip(
        requests,
        labels
    ):

        # -1 = noise
        if label == -1:
            continue

        if label not in clusters:

            clusters[label] = []

        clusters[label].append(request)

    cluster_results = []

    for cluster_id, cluster_requests in clusters.items():

        latitudes = [
            request.latitude
            for request in cluster_requests
        ]

        longitudes = [
            request.longitude
            for request in cluster_requests
        ]

        center_latitude = round(
            float(np.mean(latitudes)),
            6
        )

        center_longitude = round(
            float(np.mean(longitudes)),
            6
        )

        categories = {}

        for request in cluster_requests:

            category = request.category

            categories[category] = (
                categories.get(category, 0) + 1
            )

        dominant_category = max(
            categories,
            key=categories.get
        )

        # Calculate hotspot score

        score = calculate_hotspot_score(
            cluster_requests
        )

        cluster_results.append({

            "cluster_id": int(cluster_id),

            "request_count": len(
                cluster_requests
            ),

            "center": {
                "latitude": center_latitude,
                "longitude": center_longitude
            },

            "dominant_problem":
                dominant_category,

            "category_breakdown":
                categories,

            "request_ids": [
                request.id
                for request in cluster_requests
            ],

            "hotspot_score":
                score["hotspot_score"],

            "severity":
                score["severity"],

            "average_ai_confidence":
                score["average_confidence"]
        })

    return {

        "district": district,

        "total_requests": len(
            requests
        ),

        "total_clusters": len(
            cluster_results
        ),

        "clusters": cluster_results
    }