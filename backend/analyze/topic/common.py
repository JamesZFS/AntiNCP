import csv
import pickle

import numpy as np
from scipy.sparse import csr_matrix, save_npz, load_npz

csv_name = 'AntiNCP_Articles.csv'
# csv_name = 'demo.csv'
doc_texts: [str] = []
doc_titles: [str] = []
X = csr_matrix([])  # (doc_id, word_id) -> weight, doc_encoded as sparse matrix
vocab = np.array([], dtype=str)  # word id -> word
doc_topics = np.array([])  # (doc_id, n_topics) -> prob
doc_topics_reduced = np.array([])  # (doc_id, ) -> topic id
topics = np.array([])  # (n_topics, word_id) -> prob
n_features = 10000
n_topics = 5
random_seed = 2

np.random.seed(random_seed)


def load_pickle(filename):
    with open(f'out/{filename}', 'rb') as f:
        return pickle.load(f)


def save_pickle(data, filename):
    with open(f'out/{filename}', 'wb') as f:
        pickle.dump(data, f)


def save_encoded_vocab():
    global X, vocab
    print('Saving X and vocab...')
    save_npz('out/X.npz', X)
    np.save('out/vocab.npy', vocab)
    print()


def save_analyze_result():
    print('Saving LDA results...')
    np.save('out/doc_topics.npy', doc_topics)
    np.save('out/doc_topics_reduced.npy', doc_topics_reduced)
    np.save('out/topics.npy', topics)
    print()


def load_doc():
    print('Loading doc texts and titles...')
    with open(csv_name, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            doc_titles.append(row[2])
            doc_texts.append(row[5])
    assert len(doc_titles) == len(doc_texts)
    print(f'# doc: {len(doc_texts)}')
    print()


def load_encoded_vocab():
    print('Loading X and vocab...')
    global X, vocab
    X = load_npz('out/X.npz')
    vocab = np.load('out/vocab.npy')
    print(f'X: {X.shape}')
    print(f'vocab: {vocab.shape}')
    print()


def load_analyze_result():
    print('Loading LDA results...')
    global doc_topics, doc_topics_reduced, topics
    doc_topics = np.load('out/doc_topics.npy')
    doc_topics_reduced = np.load('out/doc_topics_reduced.npy')
    topics = np.load('out/topics.npy')
    print(f'doc_topics: {doc_topics.shape}')
    print(f'topics: {topics.shape}')
    print()


class Logger(object):
    def __init__(self, module_name):
        self.module_name = module_name

    def log(self, level, msg):
        print(f'<{self.module_name}> [{level}]', msg)

    def info(self, msg):
        self.log('Info', msg)

    def warn(self, msg):
        self.log('\033[34mWarn\033[0m', msg)

    def error(self, msg):
        self.log('\033[31mError\033[0m', msg)
