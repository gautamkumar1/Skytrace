from abc import ABC, abstractmethod

class BaseAgent(ABC):
    @property
    @abstractmethod
    def name(self):
        pass

    @abstractmethod
    def analyze(self, case_id, registration, aircraft_type, engine_type, documents):
        pass
