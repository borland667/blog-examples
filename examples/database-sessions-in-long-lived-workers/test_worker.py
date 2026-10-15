import unittest

from sqlalchemy.exc import IntegrityError, TimeoutError
from worker import Job, SessionFactory, engine, record_result


class SessionLifetimeTests(unittest.TestCase):
    def setUp(self):
        with SessionFactory.begin() as session:
            session.query(Job).delete()
            session.add(Job(id=1))

    def tearDown(self):
        self.assertEqual(engine.pool.checkedout(), 0)

    def test_success_commits_and_returns_connection(self):
        record_result(1, "done")
        self.assertEqual(engine.pool.checkedout(), 0)
        with SessionFactory.begin() as session:
            self.assertEqual(session.get(Job, 1).result, "done")

    def test_missing_job_releases_connection(self):
        with self.assertRaises(LookupError):
            record_result(99, "unused")
        self.assertEqual(engine.pool.checkedout(), 0)
        record_result(1, "next task succeeds")

    def test_flush_failure_rolls_back_and_next_unit_can_work(self):
        with self.assertRaises(IntegrityError):
            with SessionFactory.begin() as session:
                session.get(Job, 1).result = "must roll back"
                session.add(Job(id=2))
                session.add(Job(id=2))
                session.flush()
        with SessionFactory.begin() as session:
            self.assertIsNone(session.get(Job, 1).result)
            self.assertIsNone(session.get(Job, 2))
        record_result(1, "recovered with a fresh session")

    def test_held_session_exhausts_bounded_pool_until_closed(self):
        held = SessionFactory()
        try:
            held.get(Job, 1)
            self.assertEqual(engine.pool.checkedout(), 1)
            with self.assertRaises(TimeoutError):
                record_result(1, "cannot obtain connection")
        finally:
            held.close()
        record_result(1, "connection available again")


if __name__ == "__main__":
    unittest.main()
