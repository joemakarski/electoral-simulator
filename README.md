# Electoral Simulator

A full-stack interactive electoral simulator.
This application allows users to build custom districts, define demographic factions on an n-dimensional political spectrum, and run deterministic or stochastic election simulations across multiple voting algorithms.

## Key features

- A CSS grid map where users can select districts, allocate seat counts, and define the demographic shares of each region.

- Voters and candidates are placed on customizable political axes. Voter behaviour is modeled probabilistically using spatial distance and exponential decay.

- Multiple electoral systems, including:

    - Plurality / SNTV: Single Non-Transferable Vote / First Past the Post.

    - Plurality Block Voting (PBV): Multi-seat winner-takes-all.

    - Single Transferable Vote (STV): Ranked-choice system utilising the Droop Quota and fractional surplus transfers.

    - Proportional Systems: Regional PR and Mixed-Member Proportional (MMP).

- Visualisations: An interactive UI for STV elections that reconstructs fractional vote transfers, eliminations, and quota thresholds round-by-round.

- Stochastic Variance: Configurable fuzzing levels to add variance to deterministic voter logic and candidate positioning.


## Architecture

### Frontend: 
- Framework: Next.js (React)
- Language: TypeScript
- Styling: Tailwind CSS
- Also uses Zustand for global state management.

### Backend:
- Framework: Python / Django.
- Architecture: Stateless API. The backend acts as a pure computational engine. No database; utilises dataclasses instead.


## Installation & Local Setup

### Backend:
    
Navigate to the backend directory, set up your virtual environment, and run the stateless server:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate`
pip install -r requirements.txt
python manage.py runserver
```

The API will be available at http://localhost:8000/api/simulate/.

### Frontend:
In a new terminal, navigate to the frontend directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```
The app will be available at http://localhost:3000.