import common
import kmeans
import lda_analyze
import visualize

common.load_doc()
# lda_analyze.analyze()
kmeans.analyze()
visualize.doc_topic_pie()
visualize.lsa_scatter()
visualize.topic_word_cloud()
