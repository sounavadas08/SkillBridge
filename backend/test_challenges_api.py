from app.main import app
# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient

client = TestClient(app)

def test_challenges_flow():
    print("--- [SkillBridge Challenges API Test Suite] ---")

    # 1. Fetch all challenges & verify initial seed data
    res = client.get('/api/challenges')
    assert res.status_code == 200, f'GET failed with status {res.status_code}'
    data = res.json()
    print(f"[TEST 1] Initial challenges count in database: {len(data)}")
    assert len(data) >= 4, "Expected at least 4 seeded corporate challenges"

    # 2. Post a new challenge (Recruiter Action)
    new_challenge_payload = {
        'title': 'Autonomous Micro-Agent Evaluator',
        'company': 'DeepMind Labs',
        'category': 'ai',
        'stipend': '$2,000 USD',
        'duration': '5 Days',
        'description': 'Build an automated test suite benchmarking tool-calling accuracy across multi-step prompts.',
        'tags': 'Python, PyTest, LLMs',
        'starter_repo': 'https://github.com/deepmind/eval-starter'
    }
    create_res = client.post('/api/challenges', json=new_challenge_payload)
    assert create_res.status_code == 201, f'POST failed with status {create_res.status_code}'
    created = create_res.json()
    ch_id = created['id']
    print(f"[TEST 2] Created Challenge #{ch_id}: '{created['title']}' sponsored by {created['company']}")

    # 3. Submit a candidate solution (Candidate Action)
    submission_payload = {
        'candidate_name': 'Alex Chen',
        'candidate_email': 'alex.chen@stanford.edu',
        'candidate_school': 'Stanford University',
        'repo_url': 'https://github.com/alexchen/agent-eval',
        'demo_url': 'https://agent-eval.vercel.app',
        'notes': 'Implemented synthetic scenario generators with accuracy score matrix.'
    }
    sub_res = client.post(f'/api/challenges/{ch_id}/submissions', json=submission_payload)
    assert sub_res.status_code == 201, f'Submit failed with status {sub_res.status_code}'
    sub = sub_res.json()
    sub_id = sub['id']
    print(f"[TEST 3] Candidate Solution Submitted: Sub #{sub_id} by {sub['candidate_name']} ({sub['candidate_school']})")

    # 4. Recruiter verifies candidate submission and stamps seal
    verify_res = client.put(f'/api/challenges/submissions/{sub_id}/verify')
    assert verify_res.status_code == 200, f'Verify failed with status {verify_res.status_code}'
    verified_sub = verify_res.json()
    print(f"[TEST 4] Verification Stamped: Status = '{verified_sub['status']}'")
    assert verified_sub['status'] == 'verified'

    # 5. Verify challenge counters (applicants_count and verified_count) updated in DB
    get_ch = client.get(f'/api/challenges/{ch_id}')
    assert get_ch.status_code == 200
    ch_data = get_ch.json()
    print(f"[TEST 5] Challenge after submission: Applicants = {ch_data['applicants_count']}, Verified = {ch_data['verified_count']}")
    assert ch_data['applicants_count'] >= 1
    assert ch_data['verified_count'] >= 1

    # 6. Delete challenge & clean up
    del_res = client.delete(f'/api/challenges/{ch_id}')
    assert del_res.status_code == 200
    print(f"[TEST 6] Cleaned up test challenge #{ch_id}")

    print("\n>>> ALL 6 BACKEND DATABASE ENDPOINT TESTS PASSED COMPLETELY! <<<")

if __name__ == '__main__':
    test_challenges_flow()
