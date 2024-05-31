import { google } from 'googleapis';
const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL);
export async function googleGenerateAuthUrl(req, res) {
    res.json({
        url: oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/gmail.send',
            ],
        }),
    });
}
export async function googleCallback(req, res) {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log(tokens);
    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2',
    });
    const { data } = await oauth2.userinfo.get();
    const { id, email } = data;
    res.json(data);
}
export async function logout(req, res) { }
