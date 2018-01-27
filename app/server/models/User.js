var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    validator = require('validator'),
    jwt = require('jsonwebtoken');
JWT_SECRET = process.env.JWT_SECRET;

var profile = {

    // Basic info
    submittedApplication: {
        type: Boolean,
        default: false
    },

    name: {
        type: String,
        min: 1,
        maxlength: 200,
    },

    firstname: {
        type: String,
        min: 1,
        maxlength: 100,
    },

    lastname: {
        type: String,
        min: 1,
        maxlength: 100,
    },

    grade: {
        type: String,
        enum: {
            values: '9 10 11 12'.split(' ')
        }
    },

    gender: {
        type: String,
        enum: {
            values: 'M F O N'.split(' ')
        }
    },

    ethnicity: {
        type: String,
        enum: {
            values: 'B NA A H O N'.split(' ')
        }
    },

    phone: {
        type: String,
        maxlength: 20,
    },

    diet: {
        type: [String],
    },

    shirt: {
        type: String,
        enum: {
            values: 'S M L'.split(' ')
        }
    },

    school: {
        type: String,
        maxlength: 50,
    },

    departing: {
        type: String,
        maxlength: 50,
    },

    needsReimbursement: Boolean,

    site: {
        type: String,
        min: 5,
        maxlength: 240,
    },
    devpost: {
        type: String,
        min: 5,
        maxlength: 240,
    },
    github: {
        type: String,
        min: 5,
        maxlength: 240,
    },

    essayproject: {
        type: String,
        maxlength: 500,
    },

    essaygain: {
        type: String,
        maxlength: 500,
    },

    freeComment: {
        type: String,
        maxlength: 500,
    },

    pasthackathon: {
        type: String,
        maxlength: 500,
    },

    spacesOrTabs: {
        type: String,
        enum: {
            values: 'Spaces Tabs'.split(' ')
        }
    },

    methodofdiscovery: {
        type: String,
        enum: {
            values: 'mlh facebook mouth other'.split(' ')
        }
    },

    conduct: Boolean,
    termsAndCond: Boolean,
    travelreimbursement: Boolean,
    hackathonxp: Boolean

};

// Only after confirmed
var confirmation = {
    notes: {type: String,
    default: ""}
};

var teamMatchmaking = {
    enrolled: {
        type: Boolean,
        required: true,
        default: false,
    },
    enrollmentType: {
        type: String,
        enum: ['individual', 'team']
    },
    individual: {
        description: {
            type: String,
            min: 0,
            maxlength: 500,
            required: false
        },
        mostInterestingTrack: {
            type: String,
            maxlength: 120,
            required: false
        },
        role: {
            type: String,
            min: 0,
            maxlength: 100,
            required: false
        },
        topChallenges: {
            type: [String],
            required: false
        },
        slackHandle: {
            type: String,
            maxlength: 120,
            required: false
        },
        freeText: {
            type: String,
            maxlength: 120,
            required: false
        },
        skills: {
            type: String,
            required: false
        },
    },
    team: {
        mostInterestingTrack: {
            type: String,
            maxlength: 120,
            required: false
        },
        topChallenges: {
            type: [String],
            required: false
        },
        roles: {
            type: [String],
            required: false
        },
        slackHandle: {
            type: String,
            maxlength: 120,
            required: false
        },
        freeText: {
            type: String,
            maxlength: 120,
            required: false
        },
    }
}

var status = {
    /**
     * Whether or not the user's profile has been completed.
     * @type {Object}
     */
    completedProfile: {
        type: Boolean,
        required: true,
        default: false,
    },
    waitlisted: {
        type: Boolean,
        required: true,
        default: false,
    },
    admitted: {
        type: Boolean,
        required: true,
        default: false,
    },
    admittedBy: {
        type: String
    },
    confirmed: {
        type: Boolean,
        required: true,
        default: false,
    },
    reimbursementApplied: {
        type: Boolean,
        required: true,
        default: false,
    },
    declined: {
        type: Boolean,
        required: true,
        default: false,
    },
    rejected: {
        type: Boolean,
        required: true,
        default: false,
    },
    checkedIn: {
        type: Boolean,
        required: true,
        default: false,
    },
    checkInTime: {
        type: Number,
    },
    confirmBy: {
        type: Number
    },
    reimbursementGiven: {
        type: Boolean,
        default: false
    }
};
var reimbursement = {
    dateOfBirth: {
        type: String,
        default: '',
        maxlength: 100
    },
    addressLine1: {
        type: String,
        maxlength: 30
    },
    addressLine2: {
        type: String,
        maxlength: 30
    },
    stateProvinceRegion: {
        type: String,
        maxlength: 20
    },
    city: {
        type: String,
        maxlength: 30
    },
    nationality: {
        type: String,
        maxlength: 40,
        default: ''
    },
    countryOfLiving: {
        type: String,
        maxlength: 70,
    },
    accountOwnerName: {
        type: String,
        maxlength: 50,
        default: ''
    },
    accountOwnerBirthdate: {
        type: String,
        maxlength: 30,
        default: ''
    },
    accountOwnerA1: {
        type: String,
        maxlength: 30,
        default: ''
    },
    accountOwnerA2: {
        type: String,
        maxlength: 30,
        default: ''
    },
    accountOwnerZIP: {
        type: String,
        maxlength: 20,
        default: ''
    },
    accountOwnerCity: {
        type: String,
        maxlength: 30,
        default: ''
    },
    accountOwnerRegion: {
        type: String,
        maxlength: 30,
        default: ''
    },
    accountOwnerCountry: {
        type: String,
        maxlength: 30,
        default: ''
    },
    countryOfBank: {
        type: String,
        maxlength: 30
    },
    countryType: {
        type: String,
        maxlength: 30
    },
    nameOfBank: {
        type: String,
        maxlength: 60
    },
    cityOfBank: {
        type: String,
        maxlength: 30
    },
    addressOfBank: {
        type: String,
        default: '',
        maxlength: 50
    },
    fileName: {
        type: String
    },
    fileUploaded: {
        type: Boolean,
        default: false
    },
    zipCode: {
        type: String,
        default: '',
        maxlength: 10
    },
    zipCodeOfBank: {
        type: String,
        default: '',
        maxlength: 10
    },
    iban: {
        type: String,
        default: '',
        maxlength: 32
    },
    bban: {
        type: String,
        default: '',
        maxlength: 32
    },
    receiptPurposeCode: {
        type: String,
        default: '',
        maxlength: 5
    },
    accountNumber: {
        type: String,
        default: '',
        maxlength: 30
    },
    swiftOrBic: {
        type: String,
        default: '',
        maxlength: 11
    },
    clearingCode: {
        type: String,
        default: '',
        maxlength: 30
    },
    brokerageInfo: {
        type: String,
        default: '',
        maxlength: 200

    },
    additional: {
        type: String,
        default: '',
        maxlength: 200
    }
};
// define the schema for our admin model
var schema = new mongoose.Schema({

    wave: {
        type: Number
    },

    email: {
        type: String,
        required: true,
        validate: [
            validator.isEmail,
            'Invalid Email',
        ]
    },

    id: {
        type: String,
        required: true,
    },

    nickname: {
        type: String,
        min: 1,
        maxlength: 100,
        required: true
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    owner: {
        type: Boolean,
        required: true,
        default: false,
    },

    admin: {
        type: Boolean,
        required: true,
        default: false,
    },

    volunteer: {
        type: Boolean,
        required: true,
        default: false
    },

    active: {
        type: Boolean,
        required: true,
        default: true
    },

    timestamp: {
        type: Number,
        required: true,
        default: Date.now(),
    },

    lastUpdated: {
        type: Number,
        default: Date.now(),
    },

    passwordLastUpdated: {
        type: Number,
        default: Date.now(),
    },

    teamCode: {
        type: String,
        min: 0,
        maxlength: 140,
    },

    verified: {
        type: Boolean,
        required: true,
        default: false
    },

    salt: {
        type: Number,
        required: true,
        default: Date.now(),
        select: false
    },

    /**
     * User Profile.
     *
     * This is the only part of the user that the user can edit.
     *
     * Profile validation will exist here.
     */
    profile: profile,

    /**
     * Confirmation information
     *
     * Extension of the user model, but can only be edited after acceptance.
     */
    confirmation: confirmation,

    reimbursement: reimbursement,

    status: status,

    teamMatchmaking: teamMatchmaking,

    log: {
        type: [String]
    },

    applicationAdmit: {
        type: [String]
    },

    applicationReject: {
        type: [String]
    },

    votedBy: {
        type: [String]
    },

});

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

//=========================================
// Instance Methods
//=========================================

// checking if this password matches
schema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// Token stuff
schema.methods.generateEmailVerificationToken = function () {
    return jwt.sign(this.email, JWT_SECRET);
};

schema.methods.generateAuthToken = function () {
    return jwt.sign(this._id, JWT_SECRET);
};

/**
 * Generate a temporary authentication token (for changing passwords)
 * @return JWT
 * payload: {
 *   id: userId
 *   iat: issued at ms
 *   exp: expiration ms
 * }
 */
schema.methods.generateTempAuthToken = function () {
    return jwt.sign({
        id: this._id
    }, JWT_SECRET, {
        expiresInMinutes: 60,
    });
};

//=========================================
// Static Methods
//=========================================

schema.statics.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

/**
 * Verify an an email verification token.
 * @param  {[type]}   token token
 * @param  {Function} cb    args(err, email)
 */
schema.statics.verifyEmailVerificationToken = function (token, callback) {
    jwt.verify(token, JWT_SECRET, function (err, email) {
        return callback(err, email);
    });
};

/**
 * Verify a temporary authentication token.
 * @param  {[type]}   token    temporary auth token
 * @param  {Function} callback args(err, id)
 */
schema.statics.verifyTempAuthToken = function (token, callback) {
    jwt.verify(token, JWT_SECRET, function (err, payload) {

        if (err || !payload) {
            return callback(err);
        }

        if (!payload.exp || Date.now() >= payload.exp * 1000) {
            return callback({
                message: 'Token has expired.'
            });
        }

        return callback(null, payload.id);
    });
};

schema.statics.findOneByEmail = function (email) {
    return this.findOne({
        email: new RegExp('^' + email + '$', 'i')
    });
};

/**
 * Get a single user using a signed token.
 * @param  {String}   token    User's authentication token.
 * @param  {Function} callback args(err, user)
 */
schema.statics.getByToken = function (token, callback) {
    jwt.verify(token, JWT_SECRET, function (err, id) {
        if (err) {
            return callback(err);
        }
        this.findOne({_id: id}, callback);
    }.bind(this));
};

schema.statics.validateProfile = function (profile, cb) {
    return cb(!(
        profile.firstname.length > 0 &&
        profile.conduct &&
        profile.termsAndCond &&
        ['M', 'F', 'O', 'N'].indexOf(profile.gender) > -1
    ));
};

//=========================================
// Virtuals
//=========================================

/**
 * Has the user completed their profile?
 * This provides a verbose explanation of their furthest state.
 */
schema.virtual('status.name').get(function () {

    if (this.status.checkedIn) {
        return 'checked in';
    }

    if (this.status.declined) {
        return "declined";
    }

    if (this.status.confirmed) {
        return "confirmed";
    }

    if (this.status.admitted) {
        return "admitted";
    }
    if (this.status.completedProfile) {
        return "submitted";
    }

    if (!this.verified) {
        return "unverified";
    }

    return "incomplete";

});

module.exports = mongoose.model('User', schema);
