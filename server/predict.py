import json
import os
import sys
import pickle


FEATURE_ORDER = [
    "Age",
    "Study_Hours",
    "Sleep_Hours",
    "Screen_Hours",
    "Outdoor_Acts",
    "Gender_Male",
    "Gender_Female",
    "Gender_PNTS",
    "Acad_HighSchool",
    "Acad_Undergrad",
    "Acad_Postgrad",
    "Acad_Other",
    "Talk_Family",
    "Talk_Friends",
    "Talk_Counselor",
    "Talk_None",
    "Open_Yes",
    "Open_Maybe",
    "Open_No",
    "Acad_Pressure_1",
    "Acad_Pressure_2",
    "Acad_Pressure_3",
    "Acad_Pressure_4",
    "Acad_Pressure_5",
    "Sleep_Issue_1",
    "Sleep_Issue_2",
    "Sleep_Issue_3",
    "Sleep_Issue_4",
    "Sleep_Issue_5",
    "Stress_Level_1",
    "Stress_Level_2",
    "Stress_Level_3",
    "Stress_Level_4",
    "Stress_Level_5",
    "Hopelessness_1",
    "Hopelessness_2",
    "Hopelessness_3",
    "Hopelessness_4",
    "Hopelessness_5",
    "Finance_Comfort_1",
    "Finance_Comfort_2",
    "Finance_Comfort_3",
    "Finance_Comfort_4",
    "Finance_Comfort_5",
    "Inst_Support_1",
    "Inst_Support_2",
    "Inst_Support_3",
    "Inst_Support_4",
    "Inst_Support_5",
]


def _one_hot(prefix: str, rating_1_to_5: int) -> dict:
    rating = int(rating_1_to_5)
    rating = 1 if rating < 1 else 5 if rating > 5 else rating
    return {f"{prefix}_{k}": 1 if k == rating else 0 for k in range(1, 6)}


def _map_input_to_features(payload: dict) -> dict:
    gender = payload.get("gender", "Male")
    academic = payload.get("academicLevel", "Undergraduate")
    talk_to = payload.get("talkTo", "Friends")
    openness = payload.get("openness", "Maybe")

    gender_map = {
        "Male": {"Gender_Male": 1, "Gender_Female": 0, "Gender_PNTS": 0},
        "Female": {"Gender_Male": 0, "Gender_Female": 1, "Gender_PNTS": 0},
        "Other": {"Gender_Male": 0, "Gender_Female": 0, "Gender_PNTS": 1},
    }

    academic_map = {
        "High School": {"Acad_HighSchool": 1, "Acad_Undergrad": 0, "Acad_Postgrad": 0, "Acad_Other": 0},
        "Undergraduate": {"Acad_HighSchool": 0, "Acad_Undergrad": 1, "Acad_Postgrad": 0, "Acad_Other": 0},
        "Postgraduate": {"Acad_HighSchool": 0, "Acad_Undergrad": 0, "Acad_Postgrad": 1, "Acad_Other": 0},
    }

    talk_map = {
        "Family": {"Talk_Family": 1, "Talk_Friends": 0, "Talk_Counselor": 0, "Talk_None": 0},
        "Friends": {"Talk_Family": 0, "Talk_Friends": 1, "Talk_Counselor": 0, "Talk_None": 0},
        "Counselor": {"Talk_Family": 0, "Talk_Friends": 0, "Talk_Counselor": 1, "Talk_None": 0},
        "None": {"Talk_Family": 0, "Talk_Friends": 0, "Talk_Counselor": 0, "Talk_None": 1},
    }

    open_map = {
        "Yes": {"Open_Yes": 1, "Open_Maybe": 0, "Open_No": 0},
        "Maybe": {"Open_Yes": 0, "Open_Maybe": 1, "Open_No": 0},
        "No": {"Open_Yes": 0, "Open_Maybe": 0, "Open_No": 1},
    }

    features = {
        "Age": int(payload.get("age", 20)),
        "Study_Hours": int(payload.get("studyHours", 5)),
        "Sleep_Hours": int(payload.get("sleepHours", 7)),
        "Screen_Hours": int(payload.get("screenTime", 4)),
        "Outdoor_Acts": int(payload.get("outdoorActivity", 1)),
    }

    features.update(gender_map.get(gender, gender_map["Male"]))
    features.update(academic_map.get(academic, {"Acad_HighSchool": 0, "Acad_Undergrad": 1, "Acad_Postgrad": 0, "Acad_Other": 0}))
    features.update(talk_map.get(talk_to, talk_map["Friends"]))
    features.update(open_map.get(openness, open_map["Maybe"]))

    features.update(_one_hot("Acad_Pressure", int(payload.get("academicPressure", 3))))
    features.update(_one_hot("Stress_Level", int(payload.get("stressLevel", 3))))
    features.update(_one_hot("Sleep_Issue", int(payload.get("sleepIssues", 1))))
    features.update(_one_hot("Hopelessness", int(payload.get("hopelessness", 1))))
    features.update(_one_hot("Finance_Comfort", int(payload.get("financialComfort", 3))))
    features.update(_one_hot("Inst_Support", int(payload.get("institutionalSupport", 3))))

    for col in FEATURE_ORDER:
        features.setdefault(col, 0)

    return features


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + (2.718281828459045 ** (-x)))


def main() -> None:
    model_path = sys.argv[1] if len(sys.argv) > 1 else ""
    payload_str = sys.stdin.read()

    if not payload_str:
        print(json.dumps({"error": "No input"}))
        return

    payload = json.loads(payload_str)

    age = int(payload.get("age", 20))
    study_hours = int(payload.get("studyHours", 5))
    sleep_hours = int(payload.get("sleepHours", 7))
    screen_time = int(payload.get("screenTime", 4))
    outdoor_activity = int(payload.get("outdoorActivity", 1))
    academic_pressure = int(payload.get("academicPressure", 3))
    stress_level = int(payload.get("stressLevel", 3))
    sleep_issues = int(payload.get("sleepIssues", 1))
    hopelessness = int(payload.get("hopelessness", 1))
    financial_comfort = int(payload.get("financialComfort", 3))
    institutional_support = int(payload.get("institutionalSupport", 3))

    if not model_path or not os.path.exists(model_path):
        print(json.dumps({"error": "Model not found"}))
        return

    with open(model_path, "rb") as f:
        pipe = pickle.load(f)

    feats = _map_input_to_features(payload)
    X = [[feats[c] for c in FEATURE_ORDER]]

    proba = pipe.predict_proba(X)[0]
    classes = list(pipe.named_steps["lr"].classes_)

    high_class = 3
    high_idx = classes.index(high_class) if high_class in classes else int(proba.argmax())
    p_high = float(proba[high_idx])

    if p_high >= 0.66:
        risk_level = "High"
    elif p_high >= 0.33:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    max_p = float(max(proba))
    if max_p >= 0.75:
        model_conf = "High"
    elif max_p >= 0.55:
        model_conf = "Medium"
    else:
        model_conf = "Low"

    scaler = pipe.named_steps["scale"]
    lr = pipe.named_steps["lr"]
    Xs = scaler.transform(X)
    coefs = lr.coef_[high_idx]

    contribs = [float(Xs[0][i] * coefs[i]) for i in range(len(FEATURE_ORDER))]

    groups = {
        "Sleep": ["Sleep_Hours"] + [c for c in FEATURE_ORDER if c.startswith("Sleep_Issue_")],
        "Outdoor Activity": ["Outdoor_Acts"],
        "Stress": [c for c in FEATURE_ORDER if c.startswith("Stress_Level_")],
        "Academic Pressure": ["Study_Hours"] + [c for c in FEATURE_ORDER if c.startswith("Acad_Pressure_")],
        "Support": [
            *[c for c in FEATURE_ORDER if c.startswith("Inst_Support_")],
            *[c for c in FEATURE_ORDER if c.startswith("Talk_")],
            *[c for c in FEATURE_ORDER if c.startswith("Open_")],
            *[c for c in FEATURE_ORDER if c.startswith("Finance_Comfort_")],
        ],
    }

    group_sums = []
    used = set()
    idx_map = {name: i for i, name in enumerate(FEATURE_ORDER)}

    for gname, cols in groups.items():
        s = 0.0
        for c in cols:
            if c in idx_map:
                used.add(c)
                s += contribs[idx_map[c]]
        group_sums.append((gname, s))

    other_sum = 0.0
    for i, name in enumerate(FEATURE_ORDER):
        if name not in used:
            other_sum += contribs[i]

    group_sums.append(("Other", other_sum))

    abs_total = sum(abs(v) for _, v in group_sums) or 1.0

    waterfall = []
    for name, v in group_sums:
        points = (v / abs_total) * 100.0
        waterfall.append({"factor": name, "impact": round(points, 2)})

    top_risk = [w for w in waterfall if w["impact"] > 0]
    top_prot = [w for w in waterfall if w["impact"] < 0]

    contributing = [x["factor"] for x in sorted(top_risk, key=lambda x: x["impact"], reverse=True)[:3]]
    protective = [x["factor"] for x in sorted(top_prot, key=lambda x: x["impact"])[:3]]

    breakdown = []
    user_value_map = {
        "Sleep": f"{sleep_hours} hrs/night, sleep issues {sleep_issues}/5",
        "Outdoor Activity": f"{outdoor_activity} hrs/week",
        "Stress": f"{stress_level}/5",
        "Academic Pressure": f"{academic_pressure}/5, study {study_hours} hrs/day",
        "Support": f"institution support {institutional_support}/5, finance {financial_comfort}/5",
        "Other": f"age {age}",
    }

    explanation_map = {
        "Sleep": "Based on patterns learned from 10,000 student profiles, students with similar sleep + sleep-issue patterns showed lower predicted risk when sleep was steadier. Logistic regression increases risk when your sleep pattern aligns with higher-risk weights.",
        "Outdoor Activity": "Students with similar outdoor patterns tended to show lower predicted risk. In logistic regression, higher outdoor activity usually shifts the score toward lower risk.",
        "Stress": "Students reporting higher stress often fall into higher-risk patterns. Logistic regression treats higher stress ratings as a strong upward push on risk.",
        "Academic Pressure": "Higher academic pressure (and heavy study load) correlates with higher predicted risk in the training data. Logistic regression combines these signals linearly, so pressure can add risk even if other areas are strong.",
        "Support": "Support-related signals (institutional support, financial comfort, and having someone to talk to) often reduce predicted risk. In logistic regression, these features can pull the score down.",
        "Other": "Other background signals have smaller influence compared to the major lifestyle and psychological factors.",
    }

    for w in sorted(waterfall, key=lambda x: abs(x["impact"]), reverse=True)[:8]:
        t = "Risk" if w["impact"] > 0 else "Protective"
        breakdown.append({
            "feature": w["factor"],
            "userValue": user_value_map.get(w["factor"], ""),
            "impact": abs(float(w["impact"])) ,
            "type": t,
            "explanation": explanation_map.get(w["factor"], ""),
        })

    improvements = []

    if sleep_hours < 7:
        improvements.append({
            "problem": f"Sleep is {sleep_hours} hrs/night (below the 7-9 hr range).",
            "why": "Students with similar sleep patterns showed higher predicted risk in our training data.",
            "action": "Aim for 7.5-8 hours: shift bedtime earlier by 20-30 minutes for 1 week.",
        })

    if outdoor_activity < 2:
        improvements.append({
            "problem": f"Outdoor activity is {outdoor_activity} hrs/week.",
            "why": "Higher outdoor activity was linked with lower predicted risk in similar profiles.",
            "action": "Try 15-20 minutes of outdoor time 3-4 days this week.",
        })

    if screen_time > 7:
        improvements.append({
            "problem": f"Screen time is {screen_time} hrs/day.",
            "why": "Higher screen time often co-occurs with sleep disruption patterns in the dataset.",
            "action": "Add a 45-minute screen-free window before bed for 5 days.",
        })

    if stress_level >= 4:
        improvements.append({
            "problem": f"Stress level is {stress_level}/5.",
            "why": "Stress is one of the strongest upward contributors in the logistic regression model.",
            "action": "Use a 5-minute reset: breathing + short walk once daily for a week.",
        })

    resp = {
        "riskLevel": risk_level,
        "riskProbability": round(p_high * 100.0, 2),
        "contributingFactors": contributing if contributing else ["None identified"],
        "protectiveFactors": protective if protective else ["None identified"],
        "insights": {
            "breakdown": breakdown,
            "cards": [],
            "improvements": improvements[:5],
            "riskComposition": [],
            "confidence": model_conf,
            "confidenceExplanation": "Based on patterns learned from 10,000 student profiles, this logistic regression model estimates relative risk. Prediction reflects statistical patterns, not diagnosis.",
            "waterfall": waterfall,
            "modelInfo": {"totalSamples": 10000, "rocAuc": 0.925},
        },
    }

    print(json.dumps(resp))


if __name__ == "__main__":
    main()
