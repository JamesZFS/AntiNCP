from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
import lda
import common


def analyze(n_preview=10):
    # Encoding:
    print('Encoding...')
    vectorizer = CountVectorizer(stop_words='english', max_df=0.5, min_df=2, max_features=common.n_features)
    common.X = vectorizer.fit_transform(common.doc_texts)
    common.vocab = np.array(vectorizer.get_feature_names())
    print(f'encoded: {common.X.shape}')
    print(f'vocab: {common.vocab.shape}')
    print()
    common.save_encoded_vocab()

    # LDA analysis:
    print('Analyzing...')
    model = lda.LDA(n_topics=common.n_topics, n_iter=2000, random_state=common.random_seed)
    common.doc_topics = model.fit_transform(common.X)
    common.doc_topics_reduced = np.argmax(common.doc_topics, axis=1)
    common.topics = model.topic_word_
    print(f'topics: {common.topics.shape}')
    print(f'doc_topic: {common.doc_topics.shape}')
    print()

    print('----------------')

    for i, topic_dist in enumerate(common.topics):
        top_words = common.vocab[np.argsort(topic_dist)[-10:][::-1]]
        print(f'Topic {i}: {" ".join(top_words)}')

    print()
    print('----------------')

    for i in range(n_preview):
        print(f'Article {i} (topic: {common.doc_topics_reduced[i]}), {common.doc_titles[i]}')

    print()
    common.save_analyze_result()
