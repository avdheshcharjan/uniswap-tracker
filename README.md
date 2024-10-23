# Uniswap WETH-USDC Transaction Fee Tracker

A full-stack application to track and analyze transaction fees for Uniswap WETH-USDC pool transactions for Tokka Lab's Take Home Test Assignment.

## Features

- Real-time transaction monitoring
- Historical transaction data retrieval
- Transaction fee analysis in both ETH and USDT
- Interactive search and filtering
- Responsive UI with real-time updates
- Caching for improved performance

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- PostgreSQL
- Redis
- Web3.py
- Alembic for database migrations

### Frontend
- React 18
- TypeScript
- TailwindCSS
- React Query
- Axios

### Infrastructure
- Docker
- Docker Compose
- Nginx (production)

## Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local development)
- Python 3.9+ (for local development)
- Git

## Environment Variables

Create a `.env` file in the root directory:

```env
# Backend
ETHERSCAN_API_KEY=your_etherscan_api_key
WEB3_PROVIDER_URL=your_web3_provider_url
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=uniswap_tracker
REDIS_URL=redis://redis:6379

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/avdheshcharjan/uniswap-tracker.git
cd uniswap-tracker
```

2. Create and configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the application using Docker Compose:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Local Development Setup

### Backend

1. Create a Python virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run database migrations:
```bash
alembic upgrade head
```

4. Start the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```
# Project Root Structure
```
uniswap-tracker/
├── README.md
├── docker-compose.yml
├── backend/
├── frontend/
└── .gitignore

# Core configuration files
docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/uniswap_tracker
      - REDIS_URL=redis://redis:6379
      - ETHERSCAN_API_KEY=${ETHERSCAN_API_KEY}
      - WEB3_PROVIDER_URL=${WEB3_PROVIDER_URL}
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=uniswap_tracker
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

# Backend Structure
```
backend/
├── Dockerfile
├── requirements.txt
├── alembic/
│   ├── versions/
│   └── alembic.ini
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── transactions.py
│   │   │   └── stats.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── security.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── session.py
│   │   └── models/
│   │       ├── __init__.py
│   │       └── transaction.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── transaction_service.py
│   │   ├── price_service.py
│   │   └── eth_service.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── transaction.py
│   └── utils/
│       ├── __init__.py
│       └── eth_utils.py
├── collectors/
│   ├── __init__.py
│   ├── live_collector.py
│   └── historical_collector.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_api/
    └── test_services/

# Frontend Structure
frontend/
├── Dockerfile
├── package.json
├── tsconfig.json
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
└── src/
    ├── index
## API Documentation

The API documentation is available at `/docs` when running the backend server. Key endpoints include:

- `GET /api/v1/transactions` - List transactions with optional filtering
- `GET /api/v1/transactions/{hash}` - Get transaction details
- `GET /api/v1/stats` - Get overall statistics

## Architecture Decisions

1. **FastAPI for Backend**
   - High performance async framework
   - Built-in OpenAPI documentation
   - Type safety with Pydantic

2. **PostgreSQL for Database**
   - ACID compliance
   - Complex query support
   - Scalability features

3. **Redis for Caching**
   - Reduce database load
   - Improve response times
   - Cache frequently accessed data

4. **React Query for Frontend**
   - Automatic background refetching
   - Cache management
   - Loading/error states

5. **Docker for Deployment**
   - Consistent environments
   - Easy scaling
   - Simple deployment

## Scaling Considerations

1. **Database**
   - Implemented database partitioning by timestamp
   - Index optimization for common queries
   - Regular cleanup of old data

2. **Caching**
   - Multi-level caching strategy
   - Cache invalidation policies
   - Distributed caching support

3. **API**
   - Rate limiting
   - Connection pooling
   - Load balancing support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## References & Resources

### Official Documentation
1. **Uniswap**
   - [Uniswap V3 Core Documentation](https://docs.uniswap.org/protocol/introduction)
   - [Uniswap V3 SDK Documentation](https://docs.uniswap.org/sdk/introduction)
   - [Uniswap V3 Core Smart Contracts](https://github.com/Uniswap/v3-core)

2. **Ethereum & Web3**
   - [Ethereum Gas and Fees](https://ethereum.org/en/developers/docs/gas/)
   - [Web3.py Documentation](https://web3py.readthedocs.io/)
   - [Etherscan API Documentation](https://docs.etherscan.io/)

3. **Development Tools**
   - [FastAPI Documentation](https://fastapi.tiangolo.com/)
   - [React Query Documentation](https://react-query.tanstack.com/)
   - [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Technical Resources
1. **Smart Contract Interaction**
   - [Uniswap V3 Pool ABI](https://etherscan.io/address/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640#code)
   - [ERC20 Token Standard](https://eips.ethereum.org/EIPS/eip-20)
   - [Ethereum JSON-RPC API](https://eth.wiki/json-rpc/API)

2. **Backend Architecture**
   - [FastAPI Best Practices](https://fastapi.tiangolo.com/advanced/index-python/)
   - [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
   - [Redis Caching Patterns](https://redis.io/documentation)

3. **Frontend Development**
   - [React Best Practices](https://reactjs.org/docs/thinking-in-react.html)
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/)
   - [React Query Patterns](https://react-query.tanstack.com/guides/important-defaults)

### Articles & Tutorials
1. **Blockchain Development**
   - ["Understanding Uniswap V3 Gas Optimization"](https://uniswap.org/blog/uniswap-v3-gas-optimization)
   - ["Web3 Development with Python"](https://ethereum.org/en/developers/docs/programming-languages/python/)


2. **System Design (unnecessary here but who doesn't love to read clean code lol)**
   - ["Designing Data-Intensive Applications" by Martin Kleppmann](https://dataintensive.net/)
   - ["Clean Architecture" by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
   - ["12 Factor App Methodology"](https://12factor.net/)


### Tools & Libraries Used
1. **Backend**
   - [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
   - [SQLAlchemy](https://www.sqlalchemy.org/) - SQL toolkit and ORM
   - [Alembic](https://alembic.sqlalchemy.org/) - Database migration tool
   - [Web3.py](https://web3py.readthedocs.io/) - Ethereum interface library
   - [aiohttp](https://docs.aiohttp.org/) - Async HTTP client/server
   - [pytest](https://docs.pytest.org/) - Testing framework

2. **Frontend**
   - [React](https://reactjs.org/) - UI library
   - [TypeScript](https://www.typescriptlang.org/) - JavaScript with types
   - [React Query](https://react-query.tanstack.com/) - Data-fetching library
   - [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
   - [Axios](https://axios-http.com/) - HTTP client
   - [date-fns](https://date-fns.org/) - Date utility library

3. **Development & DevOps**
   - [Docker](https://www.docker.com/) - Containerization
   - [Docker Compose](https://docs.docker.com/compose/) - Multi-container orchestration
   - [PostgreSQL](https://www.postgresql.org/) - Relational database
   - [Redis](https://redis.io/) - In-memory data store
   - [nginx](https://nginx.org/) - Web server
   - [GitHub Actions](https://github.com/features/actions) - CI/CD


4. **Code Examples**
   - [Uniswap V3 Examples](https://github.com/Uniswap/v3-periphery/tree/main/contracts/examples)
   - [FastAPI Examples](https://github.com/tiangolo/fastapi/tree/master/examples)
   - [Web3.py Examples](https://web3py.readthedocs.io/en/stable/examples.html)



Note: All code in this project is original unless explicitly noted otherwise. The above resources were used for learning and reference purposes only.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

