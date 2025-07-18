from typing import Dict, List, Tuple, Optional
from similarity_matrix import SimilarityMatrix
from property_embedding import PropertyEmbedding


class RecommendationEngine:
    def __init__(self,
                 metadata_weights: Dict[str, float],
                 max_images: Dict[str, int],
                 aspect_weights: Dict[str, float],
                 top_k: int = 10):
        self.metadata_weights = metadata_weights
        self.max_images = max_images
        self.aspect_weights = aspect_weights
        self.top_k = top_k
        self.embeddings: Dict[str, PropertyEmbedding] = {}
        self.similarity_matrix: Optional[SimilarityMatrix] = None

    def add_property(self, property_id: str, property_data: dict):
        embedding = PropertyEmbedding.from_property(
            property_data,
            self.max_images,
            self.metadata_weights
        )
        self.embeddings[property_id] = embedding

        if self.similarity_matrix:
            self.similarity_matrix.add_property(property_id, embedding)

    def build_similarity_index(self):
        self.similarity_matrix = SimilarityMatrix(
            embeddings=self.embeddings,
            aspect_weights=self.aspect_weights,
            top_k=self.top_k
        )

    def get_recommendations(self, property_id: str) -> List[Tuple[str, float]]:
        if not self.similarity_matrix:
            raise Exception(
                "Similarity matrix not built. Call build_similarity_index() first.")
        return self.similarity_matrix.get_similar_properties(property_id)
