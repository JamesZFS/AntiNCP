from tqdm import tqdm

import common
import numpy as np
import nltk

topic_tags = [
    ({'china', 'chinese', 'hong', 'kong', 'wuhan'}, 10.),
    ({'us', 'states', 'trump', 'donald', 'america', 'american', 'york', 'california'}, 2.),
    ({'confirmed', 'cases', 'updated', 'new', 'deaths', 'crisis', 'total', 'outbreak', 'breaking', 'health'}, 0.9),
    ({'lockdown', 'ease', 'eases', 'isolation', 'isolating', 'isolate'}, 2.),
    ({'global', 'spread', 'uk', 'italy', 'russia', 'singapore', 'france', 'germany', 'australia', 'japan'}, 1.),
    # .. others
]

topic_names = ['China', 'US', 'Cases', 'Lockdown', 'Global']


def matched_topic(doc: str) -> int:
    words = nltk.word_tokenize(doc.lower())
    votes = [0 for _ in topic_tags]
    for word in words:
        for topic_id, (tag_set, weight) in enumerate(topic_tags):
            if word in tag_set:
                votes[topic_id] += weight
    topic = np.argmax(votes).item()
    if votes[topic] >= 1.:
        return topic
    else:
        return np.random.randint(0, common.n_topics)  # randomly pick a topic for this


def init_centroids() -> np.ndarray:  # (n_topic, n_feat)
    print('Computing initial centroids...')
    n_feat = common.X.shape[1]
    initial_centroids = np.zeros((common.n_topics, n_feat), dtype=float)
    centroid_count = np.zeros((common.n_topics,), dtype=int)
    for doc, x in zip(tqdm(common.doc_texts), common.X):
        topic = matched_topic(doc)
        initial_centroids[topic] += x
        centroid_count[topic] += 1
    print('initial centroids count:', centroid_count)
    for topic in range(common.n_topics):
        initial_centroids[topic] = initial_centroids[topic] / centroid_count[topic]
    print()
    return initial_centroids
