using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Text;
using System.Runtime.Serialization;
using System.Net;
using System.Data;
using Newtonsoft.Json;
namespace MoblieRestService
{
    [ServiceContract]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
    public class TaskService
    {
        SqlOperator op = new SqlOperator();
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "Consultation/GetInfo?StarPage={StarPage}&EndPage={EndPage}")]
        public string GetConsultationInfo(string StarPage, string EndPage)
        {
            string sql = string.Format("select * from("
                     + "select ROW_NUMBER() OVER (order by ConsultStatusID desc) as RowNumber,"
                     + " b.*,d.*"
                     + " from Consultation a left join cases b on a.ConsultID=b.ConsultID"
                     + " left join  Diagnosis c on c.ConsultID=a.ConsultID"
                     + " left join Hospital d on a.HisID=d.HisID"
                     + " left join Users e on e.UserID=d.UserID"
                     + " where 1=1  {2}) T  where RowNumber between {0} and {1}", StarPage, EndPage, "");
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            return JsonConvert.SerializeObject(dt);
        }

   

   
    }

   
}
