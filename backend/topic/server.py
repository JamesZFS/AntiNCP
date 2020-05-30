from flask import Flask, request

import common
import kmeans
import visualize
import os
import pre_clustering

app = Flask('Topic Server')

logger = common.Logger(__name__)
if 'INIT_CLF' in os.environ:
    kmeans.init()


@app.route('/ping')
def ping():
    return 'pong', 200


@app.route('/analyze')
def analyze():
    """
    Re-analyze all articles in the database, and refresh the classifier
    :return: 'OK' when done
    """
    common.load_doc()
    kmeans.analyze()
    visualize.doc_topic_pie()
    visualize.lsa_scatter()
    visualize.topic_word_cloud()
    common.doc_titles, common.doc_texts = [], []
    return 'OK', 200


@app.route('/init_clf')
def init_clf():
    """
    Manually init the classifier
    """
    kmeans.init()
    return 'OK', 200


@app.route('/re_tag')
def re_tag():
    kmeans.re_tag()
    return 'OK', 200


@app.route('/tag/<int:start_id>/<int:end_id>/')
def tag(start_id: int, end_id: int):
    if not (0 < start_id < end_id):
        return 'Bad id bound', 400
    kmeans.tag_within(start_id, end_id)
    return 'OK', 200


@app.route('/predict', methods=['POST'])
def predict():
    """
    Method: POST
    Predict topic ids from given docs

    :return: topic ids
    """
    content = request.json
    if not isinstance(content, dict):
        return 'Not json format', 400
    if "docs" not in content:
        return 'field `docs` not present', 400
    docs = content['docs']
    if not isinstance(docs, list) or len(docs) == 0:
        return '`docs` should be list and not empty', 400
    for doc in docs:
        if not isinstance(doc, str):
            return 'Wrong data type of doc', 400
    topics = kmeans.predict(docs).tolist()
    return {'topics': topics}, 200


@app.route('/topic_names')
def topic_names():
    return {'topic_names': pre_clustering.topic_names}, 200


if __name__ == '__main__':
    app.run()
