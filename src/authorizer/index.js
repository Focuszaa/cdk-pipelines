const middy = require('@middy/core')
const ssm = require('@middy/ssm')
// const { inspect } = require('util')

const baseHandler = async (event, context) => {
  // console.log(inspect(event, false, null));
  // console.log(inspect(context, false, null));

  const { canaryAuthToken, stagingAuthToken, prodAuthToken, pentestAuthToken } = context
  const { requestContext: { stage }, headers: { authorization } } = event

  // console.log('stage', stage);
  // console.log('authorization', authorization);

  let response = {
    "isAuthorized": false,
    "context": {}
  };

  switch (authorization) {
    case pentestAuthToken:
      response.isAuthorized = true;
      break;
    case canaryAuthToken:
      if (stage === 'canary') response.isAuthorized = true;
      break;
    case stagingAuthToken:
      if (stage === 'staging') response.isAuthorized = true;
      break;
    case prodAuthToken:
      if (stage === 'production') response.isAuthorized = true;
      break;
  }

  return response;
}

const handler = middy(baseHandler)
  .use(ssm({
    fetchData: {
      canaryAuthToken: '/cdk/canary/auth/token',
      stagingAuthToken: '/cdk/staging/auth/token',
      prodAuthToken: '/cdk/production/auth/token',
    },
    setToContext: true
  }))

module.exports = { handler }
