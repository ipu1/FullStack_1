const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

// Route to render the front page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to load and parse JSON file for guestbook
app.get('/guestbook', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'guestbook.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        const guestbookEntries = JSON.parse(data);
        let htmlResponse = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guestbook</title>
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <nav>
            <ul class="nav justify-content-center">
                <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                <li class="nav-item"><a class="nav-link active-nav" href="/guestbook">Guestbook</a></li>
                <li class="nav-item"><a class="nav-link" href="/newmessage">New Message</a></li>
                <li class="nav-item"><a class="nav-link" href="/ajaxmessage">Ajax Message</a></li>
            </ul>
        </nav>
    <div class="container">
        <h1>Guestbook</h1>
        <table class="table">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Country</th>
                    <th>Message</th>
                </tr>
            </thead>
            <tbody>`;

    // Loop through guestbookEntries and add each entry to the HTML response
    guestbookEntries.forEach(entry => {
        htmlResponse += `
            <tr>
                <td>${entry.username}</td>
                <td>${entry.country}</td>
                <td>${entry.message}</td>
            </tr>`;
    });

    // Close the HTML response
    htmlResponse += `
            </tbody>
        </table>
    </div>
</body>
</html>`;

    // Send the HTML response
    res.send(htmlResponse);
    });
});

// Route to render input form for new message
app.get('/newmessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'newmessage.html'));
});

// Route to handle submission of new message form
app.post('/newmessage', (req, res) => {
    const { username, country, message } = req.body;
    if (!username || !country || !message) {
        res.status(400).send('Missing required fields');
        return;
    }

    // Create new message object
    const newMessage = {
        username,
        country,
        message
    };

    // Read existing messages from JSON file
    fs.readFile(path.join(__dirname, 'data', 'guestbook.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        const guestbookEntries = JSON.parse(data);
        guestbookEntries.push(newMessage);

        // Write updated messages back to JSON file
        fs.writeFile(path.join(__dirname, 'data', 'guestbook.json'), JSON.stringify(guestbookEntries), err => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.redirect('/guestbook');
        });
    });
});

// Route to render AJAX message form
app.get('/ajaxmessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ajaxmessage.html'));
});

// Route to handle AJAX submission of new message
app.post('/ajaxmessage', (req, res) => {
    const { username, country, message } = req.body;
    if (!username || !country || !message) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    // Create new message object
    const newMessage = {
        username,
        country,
        message
    };

    // Read existing messages from JSON file
    fs.readFile(path.join(__dirname, 'data', 'guestbook.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const guestbookEntries = JSON.parse(data);
        guestbookEntries.push(newMessage);

        // Write updated messages back to JSON file
        fs.writeFile(path.join(__dirname, 'data', 'guestbook.json'), JSON.stringify(guestbookEntries), err => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json({ success: true, entries: guestbookEntries });
        });
    });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});