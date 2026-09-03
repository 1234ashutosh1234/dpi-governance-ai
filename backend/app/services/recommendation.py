from sqlalchemy.orm import Session

from backend.app.services.context_priority import (
    calculate_context_priority
)


CATEGORY_RECOMMENDATIONS = {

    "Water Supply": {
        "project": "Drinking Water Infrastructure Improvement",
        "actions": [
            "Repair damaged water pipelines",
            "Expand reliable drinking-water coverage",
            "Prioritize areas with repeated citizen complaints",
            "Monitor local water-supply availability"
        ]
    },

    "Roads": {
        "project": "Road Infrastructure Rehabilitation",
        "actions": [
            "Repair damaged roads and potholes",
            "Prioritize high-demand road segments",
            "Improve rural road connectivity",
            "Monitor road quality after intervention"
        ]
    },

    "Healthcare": {
        "project": "Primary Healthcare Capacity Improvement",
        "actions": [
            "Increase availability of medical personnel",
            "Improve medicine availability",
            "Strengthen primary healthcare centres",
            "Monitor healthcare demand"
        ]
    },

    "Electricity": {
        "project": "Electricity Reliability Improvement",
        "actions": [
            "Identify areas with unreliable electricity",
            "Upgrade local distribution infrastructure",
            "Reduce service interruptions",
            "Monitor electricity reliability"
        ]
    },

    "Education": {
        "project": "Public Education Infrastructure Improvement",
        "actions": [
            "Repair damaged school infrastructure",
            "Improve school facilities",
            "Address teacher availability gaps",
            "Monitor education service quality"
        ]
    },

    "Sanitation": {
        "project": "Sanitation Infrastructure Improvement",
        "actions": [
            "Improve waste collection",
            "Upgrade drainage systems",
            "Identify sanitation hotspots",
            "Monitor sanitation complaints"
        ]
    },

    "Public Transport": {
        "project": "Public Transport Connectivity Improvement",
        "actions": [
            "Identify underserved areas",
            "Improve public transport coverage",
            "Optimize transport routes",
            "Monitor citizen demand"
        ]
    },

    "Internet Connectivity": {
        "project": "Digital Connectivity Expansion",
        "actions": [
            "Identify connectivity gaps",
            "Expand broadband infrastructure",
            "Improve rural connectivity",
            "Monitor digital access"
        ]
    },

    "Agriculture": {
        "project": "Agricultural Infrastructure Support",
        "actions": [
            "Improve irrigation access",
            "Support agricultural services",
            "Identify high-demand farming areas",
            "Monitor agricultural infrastructure"
        ]
    },

    "Housing": {
        "project": "Affordable Housing Infrastructure Support",
        "actions": [
            "Identify vulnerable households",
            "Prioritize housing infrastructure",
            "Improve basic housing services",
            "Monitor housing requirements"
        ]
    }
}


def generate_recommendation(
    db: Session,
    district: str,
    category: str
):

    # Get priority analysis
    priority = calculate_context_priority(
        db=db,
        district=district,
        category=category
    )

    # Handle missing district
    if "error" in priority:

        return priority

    recommendation = CATEGORY_RECOMMENDATIONS.get(
        category
    )

    # Unknown category
    if recommendation is None:

        recommendation = {
            "project": "General Infrastructure Improvement",
            "actions": [
                "Investigate citizen demand",
                "Assess infrastructure gap",
                "Prioritize high-need areas"
            ]
        }

    score = priority["priority_score"]

    # Generate priority-specific explanation

    if score >= 80:

        urgency_message = (
            "Immediate government intervention is recommended "
            "because the combined demand, infrastructure gap "
            "and vulnerability indicate a critical need."
        )

        action_level = "Immediate Action"

    elif score >= 60:

        urgency_message = (
            "High-priority intervention is recommended because "
            "the district shows significant development needs."
        )

        action_level = "High Priority"

    elif score >= 40:

        urgency_message = (
            "The issue should be included in the medium-term "
            "development planning cycle."
        )

        action_level = "Medium Priority"

    else:

        urgency_message = (
            "The issue should continue to be monitored and "
            "considered during future infrastructure planning."
        )

        action_level = "Monitoring"

    return {

        "district": district,

        "category": category,

        "priority_score": score,

        "priority_level": priority[
            "priority_level"
        ],

        "recommended_project":
            recommendation["project"],

        "recommended_actions":
            recommendation["actions"],

        "action_level":
            action_level,

        "reason":
            urgency_message,

        "supporting_data": {

            "citizen_requests":
                priority["citizen_requests"],

            "population":
                priority["population"],

            "infrastructure_gap":
                priority["infrastructure_gap"],

            "vulnerability":
                priority["vulnerability"],

            "investment":
                priority["investment"]
        }
    }