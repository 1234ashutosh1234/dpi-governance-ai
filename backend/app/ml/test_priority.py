from priority_engine import calculate_priority_score


result = calculate_priority_score(
    citizen_demand=85,
    population_affected=90,
    infrastructure_gap=75,
    urgency=90,
    vulnerability=70
)

print(result)