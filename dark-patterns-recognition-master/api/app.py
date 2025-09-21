from flask import Flask, jsonify, request
from flask_cors import CORS
from joblib import load

# --- Model loading is perfect, no changes needed ---
presence_classifier = load('presence_classifier.joblib')
presence_vect = load('presence_vectorizer.joblib')
category_classifier = load('category_classifier.joblib')
category_vect = load('category_vectorizer.joblib')

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def main():
    if request.method == 'POST':
        output = []
        data = request.get_json().get('tokens')

        for token in data:
            # .predict() returns an array, e.g., ['Dark']. We need to check the first element.
            result = presence_classifier.predict(presence_vect.transform([token]))
            
            # --- LOGIC FIX HERE ---
            # Compare the string inside the array, not the array itself.
            if result[0] == 'Dark':
                cat = category_classifier.predict(category_vect.transform([token]))
                output.append(cat[0])
            else:
                output.append(result[0])

        # (Your debug printing can stay, it's helpful)
        dark = [data[i] for i in range(len(output)) if output[i] != 'Not Dark']
        print("--- Dark Patterns Detected ---")
        for d in dark:
            print(d)
        print("----------------------------")
        print(f"Found {len(dark)} dark patterns.")

        # ===================================================================
        # --- ENHANCED RESPONSE WITH SCORING AND CATEGORIZATION ---
        # Calculate transparency score (100 - penalties for each dark pattern)
        dark_patterns = []
        pattern_counts = {
            'Urgency': 0,
            'Sneaking': 0,
            'Misdirection': 0,
            'Social Proof': 0,
            'Scarcity': 0,
            'Obstruction': 0,
            'Forced Action': 0
        }

        total_patterns = 0
        for i, result in enumerate(output):
            if result != 'Not Dark':
                dark_patterns.append({
                    'text': data[i],
                    'pattern': result,
                    'index': i
                })
                pattern_counts[result] = pattern_counts.get(result, 0) + 1
                total_patterns += 1

        # Calculate transparency score (100 - penalties)
        transparency_score = max(0, 100 - (total_patterns * 5))

        # Determine risk level
        if transparency_score >= 80:
            risk_level = 'Low'
            risk_color = '#4BE680'
        elif transparency_score >= 50:
            risk_level = 'Medium'
            risk_color = '#FFA500'
        else:
            risk_level = 'High'
            risk_color = '#FF4444'

        response_data = {
            'result': output,
            'dark_patterns': dark_patterns,
            'transparency_score': transparency_score,
            'risk_level': risk_level,
            'risk_color': risk_color,
            'pattern_counts': pattern_counts,
            'total_patterns': total_patterns
        }

        return jsonify(response_data)
        # ===================================================================

if __name__ == '__main__':
    app.run(threaded=True, debug=True)
    # from flask import Flask, jsonify, request
# from flask_cors import CORS
# from joblib import load

# presence_classifier = load('presence_classifier.joblib')
# presence_vect = load('presence_vectorizer.joblib')
# category_classifier = load('category_classifier.joblib')
# category_vect = load('category_vectorizer.joblib')

# app = Flask(__name__)
# CORS(app)

# @app.route('/', methods=['POST'])
# def main():
#     if request.method == 'POST':
#         output = []
#         data = request.get_json().get('tokens')

#         for token in data:
#             result = presence_classifier.predict(presence_vect.transform([token]))
#             if result == 'Dark':
#                 cat = category_classifier.predict(category_vect.transform([token]))
#                 output.append(cat[0])
#             else:
#                 output.append(result[0])

#         dark = [data[i] for i in range(len(output)) if output[i] == 'Dark']
#         for d in dark:
#             print(d)
#         print()
#         print(len(dark))

#         message = '{ \'result\': ' + str(output) + ' }'
#         print(message)

#         json = jsonify(message)

#         return json

# if __name__ == '__main__':
#     app.run(threaded=True, debug=True)
