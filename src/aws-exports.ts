const awsconfig = {
  aws_project_region: "ap-southeast-2",

  aws_cognito_region: "ap-southeast-2",
  aws_user_pools_id: "ap-southeast-2_jT7CAyU2P",
  aws_user_pools_web_client_id: "39jjer944lr0vpsbt4v7aejno8",

  oauth: {
    domain: "ap-southeast-2jt7cayu2p.auth.ap-southeast-2.amazoncognito.com",
    scope: ["email", "openid", "profile"],
    redirectSignIn: "http://localhost:3000/",
    redirectSignOut: "http://localhost:3000/",
    responseType: "code",
  },

  aws_appsync_graphqlEndpoint:
    "https://yuxnxoklonbarnboiyirs233we.appsync-api.ap-southeast-2.amazonaws.com/graphql",
  aws_appsync_region: "ap-southeast-2",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
};

export default awsconfig;
