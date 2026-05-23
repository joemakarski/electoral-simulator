
note: curl:

curl.exe -X POST http://localhost:8000/api/simulate/ -H "Content-Type: application/json" --data-binary "@mmp_payload.json" | jq

Use cases:
- As a user, I want to be able to select a number of district tiles, then lock those in to create a nation(?) of districts.
- As a user, once I have a nation, I want to be able to inspect each district too.
- As a user, I want to be able to view and manually adjust the voting demographics of each of the districts (perhaps by having sets of voter blocks per district?).
- As a user, I want to have some selectable algorithms to distribute some pre-set demographics across different districts in case manually adjusting is too long, making it similar to real-life.
- As a user, I want to select a national electoral system (e.g. FPTP/regional PR/RCV/STV/multi-member/PR-at-large/approval/...) to run in this nation (or should there be separate systems local and national?- but maybe not as some are dependent on each other e.g. MMP).
- As a user, I want to inspect each district to see the district-level results, and visually see how the result was achieved.
- As a user, I want to be able to see the results for the nation at-large too, and visually see how the result was achieved.