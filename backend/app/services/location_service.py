import logging
from geopy.geocoders import Nominatim

logger = logging.getLogger(__name__)


# Create geocoder
geolocator = Nominatim(
    user_agent="dpi-governance-ai"
)


def reverse_geocode(
    latitude: float,
    longitude: float
):
    """
    Convert GPS coordinates into
    human-readable administrative location.
    """

    try:

        location = geolocator.reverse(
            (latitude, longitude),
            exactly_one=True,
            language="en",
            addressdetails=True,
            timeout=10,
        )

        if location is None:

            return {
                "success": False,
                "message": "Location not found",
            }


        address = location.raw.get(
            "address",
            {}
        )


        # Try multiple possible district fields
        district = (
            address.get("county")
            or address.get("state_district")
            or address.get("city_district")
            or address.get("city")
            or address.get("town")
            or address.get("municipality")
        )


        state = address.get(
            "state"
        )


        country = address.get(
            "country"
        )


        postcode = address.get(
            "postcode"
        )


        return {
            "success": True,
            "latitude": latitude,
            "longitude": longitude,
            "district": district,
            "state": state,
            "country": country,
            "postcode": postcode,
            "display_name": location.address,
        }


    except Exception as error:

        logger.error(
            "Reverse geocoding error: %s",
            error
        )

        return {
            "success": False,
            "message": str(error),
        }