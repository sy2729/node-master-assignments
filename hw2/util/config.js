// create and export configuration variable

// container for all the environments
var environments = {}

// Staging (default) environment
environments.staging = {
  'envName': 'staging',
  'hashingSecret': 'thisISASecret',
  'maxChecks': 5,
  'stripe': "sk_test_7hzgjXF0Ww5KpB6pDWRn9iLw",
  'mailGun': {
    'domain': 'sandbox882431f04ab5449e9588ba0076a799a8.mailgun.org',
    'from': 'postmaster@sandbox882431f04ab5449e9588ba0076a799a8.mailgun.org',
    'apiKey' : '9e07fb71573a52960d34c75dfc669896-9b463597-2bad2dfb'
  }
};

environments.production = {
  'envName': 'production',
  'hashingSecret': 'thisISASecret',
  'maxChecks': 5,
  'stripe': "sk_test_7hzgjXF0Ww5KpB6pDWRn9iLw",
  'mailGun': {
    'domain': 'sandbox882431f04ab5449e9588ba0076a799a8.mailgun.org',
    'from': 'postmaster@sandbox882431f04ab5449e9588ba0076a799a8.mailgun.org',
    'apiKey' : '9e07fb71573a52960d34c75dfc669896-9b463597-2bad2dfb'
  }
}

// Determine which environemtn was passed as a command-line argument
var currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environment above, if not, default to staging
var environemtnToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environemtnToExport