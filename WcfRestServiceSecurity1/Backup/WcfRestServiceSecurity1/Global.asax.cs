using System;
using System.ServiceModel.Activation;
using System.Web;
using System.Web.Routing;
using System.ServiceModel;
using System.Configuration;
using System.ServiceModel.Web;
using System.Net;

namespace MoblieRestService
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            RegisterRoutes();
        }

        private void RegisterRoutes()
        {
            //RouteTable.Routes.Add(new ServiceRoute("TaskService",
            //    new WebServiceHostFactory(), typeof(TaskService)));

            var securewebServiceHostFactory = new WebServiceHostFactory();
            RouteTable.Routes.Add(new ServiceRoute("api",
                securewebServiceHostFactory, typeof(TaskService)));
        }
    }

    public class SecureWebServiceHostFactory : WebServiceHostFactory
    {
        protected override ServiceHost CreateServiceHost(Type serviceType, Uri[] baseAddresses)
        {
            var host = base.CreateServiceHost(serviceType, baseAddresses);
            host.Authorization.ServiceAuthorizationManager = new MyServiceAuthorizationManager();
            return host;
        }

        public override ServiceHostBase CreateServiceHost(string constructorString, Uri[] baseAddresses)
        {
            var host = base.CreateServiceHost(constructorString, baseAddresses);
            host.Authorization.ServiceAuthorizationManager = new MyServiceAuthorizationManager();
          
            return host;
        }
    }

    public class MyServiceAuthorizationManager : ServiceAuthorizationManager
    {
        protected override bool CheckAccessCore(OperationContext operationContext)
        {
            var ctx = WebOperationContext.Current;
            ctx.IncomingRequest.Headers.Add("Access-Control-Allow-Origin", "*");
            //var auth = ctx.IncomingRequest.Headers[HttpRequestHeader.Authorization];
            //if (string.IsNullOrEmpty(auth) || auth != "fangxing/123")
            //{
            //    ctx.OutgoingResponse.StatusCode = HttpStatusCode.MethodNotAllowed;
            //    return false;
            //}
            return true;
        }
    }


}
