# UNL Ticket Exchange

A full-stack web application for University of Nebraska-Lincoln students to find other students to buy and sell tickets for various events.

## Tech Stack

*   **Backend:** C#, .NET, ASP.NET Core Web API, SQLite
*   **Frontend:** React, Vite, JavaScript, CSS

## Features

*   **Example Video:* https://youtu.be/aBnuuFrnTNM

*   **Browse & Filter:** View all available ticket listings. Filter by event type, price range, date, and search by event name.
*   **List Tickets:** Students with a valid UNL-affiliated email (`@unl.edu`, `@nebraska.edu`, `@huskers.unl.edu`) can list tickets for sale.
*   **Make Offers:** Make an offer on a ticket by providing your name and phone number, which is then sent to the seller.
*   **Manage Your Activity:**
    *   View and retract offers you have made.
    *   View and delete your own ticket listings.

## Getting Started

### Prerequisites

*   .NET 8 SDK or later.
*   Node.js and npm (LTS version recommended).

### Backend Setup

1.  Navigate to the project root directory in your terminal.

2.  Run the backend server:
    ```bash
    dotnet run
    ```
    The API will start, typically on `http://localhost:5106`. A `tickets.db` SQLite database file will be automatically created in the root directory if it doesn't exist.

### Frontend Setup

1.  In a **new terminal**, navigate to the `ticket-finder` directory (previously `frontend`):
    ```bash
    cd ticket-finder
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Configure the API URL:**
    The frontend needs to know the address of the backend API. Create a `.env` file in the `ticket-finder` directory with the following content:
    ```
    # In /ticket-finder/.env
    VITE_API_BASE_URL=http://localhost:5106/api
    ```
    *Note: For testing on other devices on your local network, replace `localhost` with your machine's local IP address (find it with `ipconfig` in PowerShell).*

4.  Run the frontend development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).