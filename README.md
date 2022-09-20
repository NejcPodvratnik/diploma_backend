## Backend QA

Error codes [HTTP Errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses)

## :rocket: Tech Stack

- NodeJs
- Express
- MongoDB
- Mongoose

## :warning: Prerequisite

- node
- npm
- mongodb

## :cd: How to run local

```bash
# Clone this repository
$ git clone https://github.com/NejcPodvratnik/diploma_backend

# Go into the repository
$ cd diploma_backend

# Go into server
$ cd server

# Start mongodb locally
$ mongod

# Install dependencies
$ npm install

# Start the backend server
$ npm run dev
```

## :information_source: Enpoints

#### Users 

**GET** /api/users
Lists information of all user in a given order

Body:
- String sortType (optional) - dictates what attribute is being used to sort users(default is creation date).

**GET** /api/users/:search
Lists information of all users whose username matches the given "search" regex.

Params:
- String search - the username of users must contain this string

**GET** /api/user/:id
Lists information of a user whose id matches the given id.

Params:
- String id - used to find a player by their id.

**GET** /api/users/profile/:id
Lists information about a user shown in the profile screen(username, answerScore, questionScore etc.).

Params:
- String id - used to  find a player by their id.

**GET** /api/users/promoteToDiamond/:id
Gives the user a diamond rank.

Prerequisites:
- User that gives the rank must be signed in and an admin.
- User that receives the rank must be eligable for it (>=1600 score).

Params:
- String id - used to  find a player by their id.

**POST** /api/authenticate
Signs in the user if he has correct credentials. Returns user information as well as the authentication token.

Prerequisites:
- Correct email and password must be provided.

Body:
- String email
- String password

**POST** /api/signup
Creates a new user and signs him in. Returns user information as well as the authentication token.

Prerequisites:
- Email must be provided in a correct format and must exist.
- Username must be provided, can only contain alphanumeric characters with "_" and "-". It must also be shorter than 16 characters.
- Password must be provided and be between 6 and 50 characters long.

Body:
- String email
- String password

#### Questions

**POST** /api/questions
Creates a new questions. Returns the newly created question.

Prerequisites:
- The user must be signed in.
- Title must be provided and cannot be longer than 180 characters.
- At least one tag must be provided.
- Text must be provided and be between 10 to 5000 characters long.

Body:
- String title - the title of the question.
- String text - a short description of the question to give users a better understanding of the problem.
- String tags - an array of tags in a string format. Used to categorize questions into one or more category.

**POST** /api/question

Lists information of questions that match a given filter and are sorted in a specified order.

Prerequisites:
- The user must be signed in.
- Title must be provided and cannot be longer than 180 characters.
- At least one tag must be provided.
- Text must be provided and be between 10 to 5000 characters long.

Body:
- String sortType (optional) - dictates what attribute is being used to sort questions (default score).
- String tags (optional) - listed questions must contain every tag specified.
- String search (optional) - the title of listed questions must match this string.
- Bool favorite - if set to true only favorited questions will be listed (default false).
-String userId (optional) - will only list questions posted by the user with the given id.

**GET** /api/question/:question

Lists information of a question with the given id. Also increases its views number by 1.

Params:
- String question - Id of the listed question.

**GET** /api/question/favorite/:question

Favorites/Unfavorites the question with the given id. Also lists its information.

Prerequisites:
- The user must be signed in.

Params:
- String question - Id of the specified question.

**DELETE** /api/question/:question

Deletes the question with the specified id.

Prerequisites:
- The user must be signed in.
- The user must either be the author of the question or an admin.

Params:
- String question - Id of the specified question.

#### Answers

**POST** /api/answer/:question
Creates and returns an anwser. The answer is given to the question with a specified id.

Prerequisites:
- The user must be signed in.
- The user can only post one answer for a given question.
- Text must be provided and be between 10 to 30000 characters long.

Params:
- String question - id of the question the answer is referring to.

Body:
- String text - an answer to the question.

**GET** /api/answer/helpful/:question/:answer
Marks/Unmarks the answer as helpful. Returns its information.

Prerequisites:
- The user must be signed in.
- The user must either be the author of the question or an admin.

Params:
- String question - id of the question the answer is referring to.
- String answer - id of the answer.

**PUT** /api/answer/:question/:answer
Updates the text and date of the specified answer and returns its information.

Prerequisites:
- The user must be signed in.
- The user must either be the author of the answer or an admin.
- Text must be provided and be between 10 to 30000 characters long.

Params:
- String question - id of the question the answer is referring to.
- String answer - id of the answer.

Body:
- String text - new answer to the question

**DELETE** /api/answer/:question/:answer
Deletes the specified answer.

Prerequisites:
- The user must be signed in.
- The user must either be the author of the answer or an admin.

Params:
- String question - id of the question the answer is referring to.
- String answer - id of the answer.

### Votes

**GET** /api/votes/upvote/:question/:answer?
The user upvotes (gives 10 points) the specified question or answer.

Prerequisites:
- The user must be signed in.
- The user cannot vote his own question or answer.
- The user can only vote a given answer or question once.

Params:
- String question - id of the upvoted question or the id of the question the answer is referring to.
- String answer (optional) - id of the upvoted answer.

**GET** /api/votes/downvote/:question/:answer?
The user downvotes (deducts 5 points) the specified question or answer.

Prerequisites:
- The user must be signed in.
- The user cannot vote his own question or answer.
- The user can only vote a given answer or question once.

Params:
- String question - id of the downvoted question or the id of the question the answer is referring to.
- String answer (optional) - id of the downvoted answer.

**GET** /api/votes/unvote/:question/:answer?
The user removes his vote from the specified question or answer.

Prerequisites:
- The user must be signed in.
- The specified question or answer must be voted by the user.

Params:
- String question - id of the unvoted question or the id of the question the answer is referring to.
- String answer (optional) - id of the unvoted answer.









































