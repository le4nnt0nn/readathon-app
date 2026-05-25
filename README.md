# readathon-app
A book app to admin all your reads :)

This project requires a `.env` file in the root directory. Create one based on the template below:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_here
GOOGLE_BOOKS_KEY=your_google_books_api_key_here
```

### Getting your credentials

| Variable | Description | How to obtain |
|---|---|---|
| `PORT` | Port the server will run on | Any available port, default `3000` |
| `MONGO_URI` | MongoDB connection string | [MongoDB Atlas](https://www.mongodb.com/atlas) → your cluster → Connect |
| `JWT_SECRET` | Secret key for signing JWT tokens | Any long random string |
| `GOOGLE_BOOKS_KEY` | Google Books API key | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials |

> **Never commit your `.env` file to version control.** Make sure `.env` is listed in your `.gitignore`.
