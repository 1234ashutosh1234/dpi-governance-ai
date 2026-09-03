import csv

from backend.app.db.database import SessionLocal

from backend.app.models.district_indicator import (
    DistrictIndicator
)


CSV_PATH = "data/raw/district_indicators.csv"


def load_district_data():

    db = SessionLocal()

    try:

        # Avoid inserting duplicate records
        existing_count = (
            db.query(DistrictIndicator)
            .count()
        )

        if existing_count > 0:

            print(
                "District data already exists."
            )

            return

        with open(
            CSV_PATH,
            "r",
            encoding="utf-8"
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                district = DistrictIndicator(

                    district=row["district"],

                    state=row["state"],

                    population=int(
                        row["population"]
                    ),

                    population_density=float(
                        row["population_density"]
                    ),

                    literacy_rate=float(
                        row["literacy_rate"]
                    ),

                    water_access=float(
                        row["water_access"]
                    ),

                    electricity_access=float(
                        row["electricity_access"]
                    ),

                    road_quality=float(
                        row["road_quality"]
                    ),

                    healthcare_access=float(
                        row["healthcare_access"]
                    ),

                    vulnerability=float(
                        row["vulnerability"]
                    ),

                    infrastructure_investment=float(
                        row["infrastructure_investment"]
                    )
                )

                db.add(district)

            db.commit()

            print(
                "District data loaded successfully."
            )

    finally:

        db.close()


if __name__ == "__main__":

    load_district_data()