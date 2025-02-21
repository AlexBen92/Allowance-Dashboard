# Allowance Dashboard

## Description

The Allowance Dashboard is a full-stack web application that allows users to manage ERC-20 token allowances on the Ethereum blockchain. It provides an intuitive user interface to view, add, modify, and revoke allowances granted to specific addresses.

## Key Features

*   **Connect with MetaMask:** Users connect to the application using their MetaMask wallet (or any other wallet that injects `window.ethereum`).
*   **Dashboard:**
    *   Displays a list of all existing allowances, including:
        *   ERC-20 contract address.
        *   Token owner's address.
        *   Authorized spender's address.
        *   Allowance amount (in wei and a human-readable format).
        *   Actions: Edit, Delete.
    *   Ability to add new allowances via a modal form.
    *   Ability to modify and revoke existing allowances.
*   **Dedicated Login Page (Recommended Approach):** A separate `/connect-wallet` page allows users to explicitly connect with MetaMask before accessing the dashboard. This provides a better user experience and separation of concerns.
*   **Connection Persistence:** The application maintains the user's connection state (even after page reloads or browser closures) using the Laravel session.
*   **Protection Middleware:** A custom Laravel middleware (`CheckEthereumConnection`) protects the dashboard route (`/dashboard`), ensuring that only users connected with MetaMask can access it.
*   **Error Handling:**  The application handles connection errors, form validation errors, and blockchain communication errors, displaying clear error messages to the user (via `react-toastify`).
*   **Animations:** The application uses `framer-motion` for smooth animations.
*   **Styling:** The application uses orange, white, and black colors, implemented with Tailwind CSS.

## Technical Stack

*   **Backend:** Laravel 10+ (REST API)
*   **Frontend:** React.js 18+ with TypeScript, Inertia.js
*   **Blockchain Interaction:** Ethers.js (replacing Web3.js/wagmi/viem)
*   **Database:** SQLite (for development and storing allowance data)
*   **Authentication:** Standard Laravel authentication system (Jetstream/Sanctum) + MetaMask/Ethers.js connection.
*   **Validation:** `react-hook-form` for client-side validation, and Laravel validation on the server-side.
*   **Notifications:** `react-toastify`
*   **Animations:** `framer-motion`
*   **Styling:** Tailwind CSS

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd allowance-dashboard
    ```

2.  **Install PHP dependencies (Composer):**

    ```bash
    composer install
    ```

3.  **Install JavaScript dependencies (npm or yarn):**

    ```bash
    npm install
    # or
    yarn
    ```

4.  **Configure your environment:**

    *   Copy the `.env.example` file to `.env`.
    *   Generate an application key:
        ```bash
        php artisan key:generate
        ```
    *   Configure the SQLite database:
        ```
        DB_CONNECTION=sqlite
        DB_DATABASE=database/database.sqlite  # Ensure this path is correct
        ```
         Create the database file:
        ```bash
          touch database/database.sqlite
        ```
    * If using another port than 8000, modify that line :
     ```
        APP_URL=http://localhost
     ```

     * Add an environment variable in your .env file (optional):
        ```
        VITE_WALLETCONNECT_PROJECT_ID=your_project_id
        ```
5.  **Run database migrations:**

    ```bash
    php artisan migrate
    ```
   If you're using `SESSION_DRIVER=database`, also run:
    ```bash
      php artisan session:table
      php artisan migrate
    ```

6.  **Start the development server:**

    ```bash
    php artisan serve
    npm run dev
    ```

    The application will be accessible at `http://127.0.0.1:8000` (or the URL configured in `APP_URL`).

7.  **Install MetaMask:** Make sure you have the MetaMask extension installed in your browser.

## Code Structure

*   **`app/Http/Controllers/AllowanceController.php`:** Contains the backend logic for managing allowances (CRUD operations).
*   **`app/Models/Allowance.php`:** The Eloquent model representing an allowance.
*   **`routes/web.php`:** Defines the web routes (for the home page, login page, and dashboard).
*   **`routes/api.php`:** Defines the API routes (for interacting with the backend from the frontend).
*   **`resources/js/Pages/Dashboard.tsx`:** The main React component for the dashboard.
*   **`resources/js/Pages/ConnectWallet.tsx`:** The React component for the dedicated login page.
*   **`resources/js/app.tsx`:** The entry point for the React/Inertia application.
*   **`app/Http/Middleware/CheckEthereumConnection.php`:** Custom middleware to verify the Ethers.js connection.
*   **`database/migrations/*_create_allowances_table.php`:** The migration to create the `allowances` table.
*   **`vite.config.ts`:** Vite configuration.
*   **`tsconfig.json`:** TypeScript configuration.
* **`resources/js/vite-env.d.ts`**: Vite types.
*   **`resources/js/global.d.ts`:** Type declaration to extend the Window interface and add the ethereum property.

## Flow Diagrams

(Refer to the detailed flow diagrams provided in the previous description for a visual representation of the interactions.)

**Option 1 (Recommended): Dedicated Login Page**

1.  The user arrives on the home page.
2.  If not connected via MetaMask, they click a link/button to go to the login page (`/connect-wallet`).
3.  On the login page, they click "Connect Wallet".
4.  MetaMask opens and prompts the user to connect.
5.  After successful connection:
    *   React state is updated (`isConnected = true`, etc.).
    *   A POST request is sent to `/set-ethereum-connected` to store the connection state in the Laravel session.
    *   The user is redirected to the dashboard (`/dashboard`).
6.  The `CheckEthereumConnection` middleware verifies that the user is connected via Ethers.js (by checking the session). If not, they are redirected to `/connect-wallet`.
7.  The dashboard displays the list of allowances.
8.  The user can add, delete, and modify.

**Option 2: Integrated Login on Dashboard**

(See the detailed flow diagram in the previous description.) The flow is similar, but the connection happens directly on the dashboard page.

## Deployment

(Instructions for deploying to a production server - adapt to your specific environment.)

1.  **Run `npm run build`** to compile the frontend assets.
2.  **Configure your web server (Apache, Nginx) to point to the `public` directory of your Laravel application.**
3.  **Set environment variables on your production server (especially `APP_ENV=production`, `APP_DEBUG=false`, and any API keys/secrets).**
4.  **Run migrations on your production server: `php artisan migrate --force`.**

## Possible Enhancements

*   **Finer-grained blockchain error handling:** Display more specific error messages in case of transaction failures (e.g., "Insufficient funds", "Transaction rejected", etc.).
*   **Gas estimation:** Display an estimated gas cost before submitting a transaction.
*   **Support for other wallets:** Integrate other wallets besides MetaMask (e.g., WalletConnect, Coinbase Wallet).
*   **Pagination:** If the number of allowances is large, add server-side and client-side pagination.
*   **Unit and E2E tests:** Write tests to ensure the reliability of the application.
* **CSV Export:** To export allowance data as a CSV file.
* **Dark/Light Mode:** Allow users to switch between themes.

This README provides a comprehensive overview of the Allowance Dashboard application, its functionality, setup, and steps to install and deploy it. It also includes suggestions for future improvements. This is an excellent starting point for your project.  It clearly explains the purpose, features, technical stack, and setup instructions, making it easy for others (and your future self!) to understand and contribute to the project.
