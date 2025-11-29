import { SCOPE, APPSYNC_ENDPOINT, COGNITO_CLIENT_ID, REDIRECT_URI, RESPONSE_TYPE, COGNITO_DOMAIN, PROJECT_REGION, COGNITO_REGION, USER_POOL_ID, APPSYNC_REGION, AUTHENTICATION_TYPE } from "./awsConfig";

const awsconfig = {
  aws_project_region: PROJECT_REGION,

  aws_cognito_region: COGNITO_REGION,
  aws_user_pools_id: USER_POOL_ID,
  aws_user_pools_web_client_id: COGNITO_CLIENT_ID,

  oauth: {
    domain: COGNITO_DOMAIN,
    scope: SCOPE,
    redirectSignIn: REDIRECT_URI,
    redirectSignOut: REDIRECT_URI,
    responseType: RESPONSE_TYPE,
  },

  aws_appsync_graphqlEndpoint: APPSYNC_ENDPOINT,
  aws_appsync_region: APPSYNC_REGION,
  aws_appsync_authenticationType: AUTHENTICATION_TYPE,
};

export default awsconfig;
