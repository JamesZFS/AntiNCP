import numpy as np
from matplotlib import pyplot as plt
from sklearn.decomposition import TruncatedSVD
from tqdm import tqdm
from wordcloud import WordCloud

import common


def make_freq_dict(topic_dist: np.ndarray) -> dict:  # str -> freq
    return dict([(common.vocab[word_id], prob) for word_id, prob in enumerate(topic_dist)])


def make_topic_dist() -> [int]:  # topic_id -> doc count
    dist = [0 for _ in range(common.n_topics)]
    for topic in common.doc_topics_reduced:
        dist[topic] += 1
    return dist


def lsa_reduce():
    print("Performing dimensionality reduction using LSA...")
    svd = TruncatedSVD(n_components=2)
    x = svd.fit_transform(common.X)
    print()
    return x


def topic_word_cloud():
    print('Making word cloud...')
    for i, topic_dist in enumerate(tqdm(common.topics)):
        wc = WordCloud(width=1024, height=768)
        wc.generate_from_frequencies(make_freq_dict(topic_dist))
        wc.to_file(f'out/topic/{i}.png')
    print()


def doc_topic_pie():
    print('Making topic pie...')
    topic_ids = list(range(common.n_topics))
    plt.figure()
    plt.pie(make_topic_dist(), labels=topic_ids)
    plt.axis('equal')
    plt.savefig('out/article-topic distribution.png')
    print()


def lsa_scatter():
    print('Making topic scatter...')
    x = lsa_reduce()
    plt.figure()
    scatter = plt.scatter(x[:, 0], x[:, 1], c=common.doc_topics_reduced,
                          s=10, alpha=0.5)
    plt.legend(*scatter.legend_elements(), loc='upper right', title='topics')
    plt.savefig('out/article-topic lsa scatter.png')
    print()


if __name__ == '__main__':
    common.load_encoded_vocab()
    common.load_analyze_result()
    topic_word_cloud()
