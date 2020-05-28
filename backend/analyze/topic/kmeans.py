import pickle

import numpy as np
from sklearn.cluster import MiniBatchKMeans, KMeans
from sklearn.feature_extraction.text import TfidfVectorizer

import common
from pre_clustering import init_centroids


def load() -> KMeans:
    with open('out/km.pickle', 'rb') as f:
        return pickle.load(f)


def save(model: KMeans):
    with open('out/km.pickle', 'wb') as f:
        pickle.dump(model, f)


def analyze(n_preview=10):
    # Encode:
    print('Encoding...')
    vectorizer = TfidfVectorizer(max_df=0.5, max_features=common.n_features,
                                 min_df=2, stop_words='english')
    common.X = vectorizer.fit_transform(common.doc_texts)
    common.vocab = np.array(vectorizer.get_feature_names())
    print(f'X: {common.X.shape}')
    print()
    common.save_encoded_vocab()

    print('Clustering...')
    # km = MiniBatchKMeans(n_clusters=common.n_topics, init=init_centroids(), init_size=1000, batch_size=1000,
    #                      verbose=0, random_state=common.random_seed)
    # km = MiniBatchKMeans(n_clusters=common.n_topics, verbose=1, random_state=1)
    km = KMeans(n_clusters=common.n_topics, init=init_centroids(), max_iter=3, verbose=1, random_state=2)

    # Analyze:
    common.doc_topics = km.fit_transform(common.X)  # the smaller, the closer
    common.doc_topics_reduced = np.argmin(common.doc_topics, axis=1)
    common.topics = km.cluster_centers_
    save(km)
    print(f'doc_topics: {common.doc_topics.shape}')
    print(f'topics: {common.topics.shape}')
    print()

    print('----------------')
    for i, topic_dist in enumerate(common.topics):
        top_words = common.vocab[np.argsort(topic_dist)[-10:][::-1]]
        print(f"Topic {i}: {' '.join(top_words)}")

    print()
    print('----------------')

    for i in range(n_preview):
        print(f'Article {i} (topic: {common.doc_topics_reduced[i]}), {common.doc_titles[i]}')

    print()
    common.save_analyze_result()
