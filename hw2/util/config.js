// create and export configuration variable

// container for all the environments
var environments = {}

// Staging (default) environment
environments.staging = {
  'envName': 'staging',
  'hashingSecret': 'thisISASecret',
  'maxChecks': 5,
};

environments.production = {
  'envName': 'production',
  'hashingSecret': 'thisISASecret',
  'maxChecks': 5,
}

// Determine which environemtn was passed as a command-line argument
var currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environment above, if not, default to staging
var environemtnToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environemtnToExport