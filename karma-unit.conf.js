module.exports = function(config) {
  config.set({
    'frameworks': ['jasmine'],
    'browsers': ['Firefox','Chrome'],
    'files': [
      'spec/unit/*.js'
    ]
  });
};
