from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import QueuePool

Base = declarative_base()


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True)
    result = Column(String, nullable=True)


engine = create_engine(
    "sqlite://", poolclass=QueuePool,
    pool_size=1, max_overflow=0, pool_timeout=0.01,
)
Base.metadata.create_all(engine)
SessionFactory = sessionmaker(bind=engine)


def record_result(job_id, result):
    with SessionFactory.begin() as session:
        job = session.get(Job, job_id)
        if job is None:
            raise LookupError(job_id)
        job.result = result
