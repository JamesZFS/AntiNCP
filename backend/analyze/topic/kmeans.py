import numpy as np
from sklearn.cluster import MiniBatchKMeans, KMeans
from sklearn.feature_extraction.text import TfidfVectorizer

import common
from pre_clustering import init_centroids

vectorizer: TfidfVectorizer
km: KMeans

logger = common.Logger('kmeans')


def analyze(n_preview=10):
    global vectorizer, km
    # Encode:
    logger.info('Encoding...')
    vectorizer = TfidfVectorizer(max_df=0.5, max_features=common.n_features,
                                 min_df=2, stop_words='english')
    common.X = vectorizer.fit_transform(common.doc_texts)
    common.save_pickle(vectorizer, 'vectorizer.pickle')
    common.vocab = np.array(vectorizer.get_feature_names())
    logger.info(f'X: {common.X.shape}')
    common.save_encoded_vocab()

    logger.info('Clustering...')
    # km = MiniBatchKMeans(n_clusters=common.n_topics, init=init_centroids(), init_size=1000, batch_size=1000,
    #                      verbose=0, random_state=common.random_seed)
    # km = MiniBatchKMeans(n_clusters=common.n_topics, verbose=1, random_state=1)
    km = KMeans(n_clusters=common.n_topics, init=init_centroids(), max_iter=3, verbose=1, random_state=2)

    # Analyze:
    common.doc_topics = km.fit_transform(common.X)  # the smaller, the closer
    common.doc_topics_reduced = np.argmin(common.doc_topics, axis=1)
    common.topics = km.cluster_centers_
    common.save_pickle(km, 'km.pickle')
    logger.info(f'doc_topics: {common.doc_topics.shape}')
    logger.info(f'topics: {common.topics.shape}')
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


def predict(docs: [str]) -> [int]:
    """
    Classify a doc to a most likely topic
    :param docs: documents to classify
    :return: topic ids
    """
    X = vectorizer.transform(docs)
    return km.predict(X)


def init():
    global vectorizer, km
    vectorizer = common.load_pickle('vectorizer.pickle')
    km = common.load_pickle('km.pickle')
    logger.info('Initialized')
