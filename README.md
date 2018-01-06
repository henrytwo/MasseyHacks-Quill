# Quill
Registration, for hackers!
For Junction!
Quill is a registration system designed especially for hackathons. For hackers, it’s a clean and streamlined interface to submit registration and confirmation information. For hackathon organizers, it’s an easy way to manage applications, view registration stats, and more!

# Setup

Getting a local instance of Quill up and running takes less than 5 minutes! Start by setting up the database. Ideally, you should run MongoDB as a daemon with a secure configuration (with most linux distributions, you should be able to install it with your package manager, and it'll be set up as a daemon). Although not recommended for production, when running locally for development, you could do it like this

```
mkdir db
mongod --dbpath db --bind_ip 127.0.0.1 --nohttpinterface
```

Install the necessary dependencies:
```
npm install
bower install
npm run config
```

Edit the configuration file in `.env` for your setup, and then run the application:
```
gulp server
```

# Deploying to server:

You first need your ssh-key added to the server. Then, add a new git remote
```
git remote add dokku dokku@94.237.29.37:junction
```

Now you can push your changes to the server by running
```
git push dokku master
```
or if you want to push some other branch than master,
```
git push dokku <branch>:master
```

# Git management

* `production` branch runs at `94.237.29.37` at port 80
* `staging` branch is used to test changes before merging them to production. This is not currently used.
* `development` branch is used for development. Please branch new features from this branch.
* `master` is a stable version of the site and should only be merged into when all the features are 100% working.

The workflow is to first create new feature branches from `development` and merge into it when the feature is stable.
After we want to see the changes live we merge `development` into `staging` and finally into `production`.

# Customizing for your event

###### _If you're using Quill for your event, please add yourself to this [list][users]. It takes less than a minute, but knowing that our software is helping real events keeps us going ♥_
### Copy
If you’d like to customize the text that users see on their dashboards, edit them at `client/src/constants.js`.

### Branding / Assets
Customize the color scheme and hosted assets by editing `client/stylesheets/_custom.scss`. Don’t forget to use your own email banner, favicon, and logo (color/white) in the `assets/images/` folder as well!

### Application questions
If you want to change the application questions, edit:
- `client/views/application/`
- `server/models/User.js`
- `client/views/admin/user/` and `client/views/admin/users/` to render the updated form properly in the admin view

If you want stats for your new fields:
- Recalculate them in `server/services/stats.js`
- Display them on the admin panel by editing `client/views/admin/stats/`

### Email Templates
To customize the verification and confirmation emails for your event, put your new email templates in `server/templates/` and edit `server/services/email.js`

# Contributing
Contributions to Quill are welcome and appreciated! Please take a look at [`CONTRIBUTING.md`][contribute] first.

# Feedback / Questions
If you have any questions about this software, please contact [quill@hackmit.org][email].

# License
Copyright (c) 2015-2016 Edwin Zhang (https://github.com/ehzhang). Released under AGPLv3. See [`LICENSE.txt`][license] for details.

[contribute]: https://github.com/techx/quill/blob/master/CONTRIBUTING.md
[license]: https://github.com/techx/quill/blob/master/LICENSE.txt
[email]: mailto:quill@hackmit.org
[users]: https://github.com/techx/quill/wiki/Quill-Users
