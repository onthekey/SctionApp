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
using System.IO;
using MoblieRestService.Vo;
using System.Web;
using System.Configuration;
using System.Web.SessionState;

using MoblieRestService.datebase;

namespace MoblieRestService
{
    [ServiceContract]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
    public class ExpertService
    {
        SqlOperator op = new SqlOperator();

        //获取会诊信息
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "Consultation?reviewtype={reviewtype}&invitedtype={invitedtype}&keyword={keyword}&sdate={sdate}&edate={edate}&casetype={casetype}&StarPage={StarPage}&EndPage={EndPage}&HisID={HisID}&ConsultStatusID={ConsultStatusID}&UserID={UserID}")]
        public string GetConsultationInfo(string reviewtype, string invitedtype, string keyword, string sdate, string edate, string casetype, string StarPage, string EndPage, string HisID, string ConsultStatusID, string UserID)
        {
            string swhere = "";
            //string swhere1 = "";
            string temp = "";
            if (HisID != "" && HisID != "0")
            {
                swhere += " and d.HisID=" + HisID;
                //swhere1 += "and Hospital.HisID = " + HisID;
            }
            if (keyword != "")
            {
                temp += " and (Case_No like '%" + keyword + "%' or Name like '%" + keyword + "%')";
            }
            if (sdate != "" && edate != "")
            {
                temp += " and ConsultTime between '" + DateTime.Parse(sdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Parse(edate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (sdate == "" && edate != "")
            {
                temp += " and ConsultTime between '1970-01-01 23:59:59' and '" + DateTime.Parse(edate).ToString("yyyy-MM-dd 23:59:59") + "'";

            }
            if (sdate != "" && edate == "")
            {
                temp += " and ConsultTime between '" + DateTime.Parse(sdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Now.ToString("yyyy-MM-dd 23:59:59") + "'";

            }
            if (casetype != "")
            {
                temp += " and CaseTypeID='" + casetype + "'";
            }

            swhere += temp;
            //swhere1 += temp;

            if (ConsultStatusID != "")
            {
                if (ConsultStatusID == "1")//待诊断
                {
                    temp = " and (ConsultStatusID=1 or ConsultStatusID=2)";
                }
                else if (ConsultStatusID == "2")//已诊断
                {
                    temp = " and ConsultStatusID=4";
                }
                else if (ConsultStatusID == "3")//退回
                {
                    temp = " and (ConsultStatusID=-1 or ConsultStatusID=-2)";
                }
                else if (ConsultStatusID == "99")//收藏
                {
                    // 这个语句是来搞笑的么
                    swhere += " and   exists(select 1 from Collect where UserID=" + UserID + " and ConsultID=a.ConsultID)";

                    //swhere1 += " AND Consultation.ConsultID IN ( SElECT ConsultID FROM Collect WHERE UserID = " + UserID + ") ";

                }
                else if (ConsultStatusID == "98")//受邀
                {
                    if (invitedtype == "0")
                    {
                        temp = " and   exists(select 1 from Invite where ToExpID=" + UserID + " and ConsultID=a.ConsultID  )";
                    }
                    else if (invitedtype == "1")
                    {
                        temp = " and   exists(select 1 from Invite where ToExpID=" + UserID + " and ConsultID=a.ConsultID and DiagnosisTime is  null)";
                    }
                    else if (invitedtype == "2")
                    {
                        temp = " and   exists(select 1 from Invite where ToExpID=" + UserID + " and ConsultID=a.ConsultID and DiagnosisTime is not null)";
                    }
                    swhere += " and  ConsultStatusID!=-77 ";
                }
                else if (ConsultStatusID == "97")//复核
                {
                    if (reviewtype == "0")
                    {
                        temp = " and   (IsRecheck=1 or IsRecheck=0 or IsRecheck=-1)  and RecheckUser=" + UserID;
                        //temp = " and    IsRecheck=0   and RecheckUser=" + UserID;
                    }
                    else if (reviewtype == "1")//待复核
                    {
                        temp = "and   IsRecheck=0   and RecheckUser=" + UserID;
                    }
                    else if (reviewtype == "2")//已复核
                    {
                        temp = "and   IsRecheck=1   and RecheckUser=" + UserID;
                    }
                    else if (reviewtype == "3")//复核退回
                    {
                        temp = "and   IsRecheck=-1  and RecheckUser=" + UserID;
                    }
                    temp += " and  ConsultStatusID!=-77 ";
                }

            }

            if (ConsultStatusID != "")
            {
                if (ConsultStatusID != "99")
                {
                    swhere += temp;
                    //swhere1 += temp;
                }
            }
           

            if (ConsultStatusID != "98" && ConsultStatusID != "97")
            {
                swhere += " and c.ExpID='" + UserID + "' and ConsultStatusID!=99 and ConsultStatusID!=100 and  ConsultStatusID!=101 and  ConsultStatusID!=-77 ";
               // swhere1 += " and Diagnosis.ExpID='" + UserID + "' and ConsultStatusID!=99 and ConsultStatusID!=100 and  ConsultStatusID!=101 and  ConsultStatusID!=-77 ";
            }
            string sql = string.Format("select * from("
                     + "select ROW_NUMBER() OVER (order by b.ConsultID DESC) as RowNumber,"
                     + " b.*,d.*,ConsultTime,IsRecheck,ConsultStatusID,c.ExpId,"
                     + "(select DisplayName from Invite a left join Users k on k.UserID=a.FromExpID where ConsultID=b.ConsultID and ToExpID=" + UserID + ") as fromexp,"
                     + "(select DisplayName from Diagnosis a left join Users k on k.UserID=a.ExpID where ConsultID=b.ConsultID) as expname,"
                     + "(select 1 from Invite where ConsultID=b.ConsultID and ToExpID=" + UserID + " and DiagnosisTime is null) as isInvite"
                     + " from Consultation a left join cases b on a.ConsultID=b.ConsultID"
                     + " left join  Diagnosis c on c.ConsultID=a.ConsultID"
                     + " left join Hospital d on a.HisID=d.HisID"
                     + " left join Users e on e.UserID=d.UserID"
                     + " where 1=1  {2}) T  where RowNumber between {0} and {1}", StarPage, EndPage, swhere);
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);

            string count = string.Format("select count(*) as c"
                + " from Consultation a left join cases b on a.ConsultID=b.ConsultID"
                     + " left join  Diagnosis c on c.ConsultID=a.ConsultID"
                     + " left join Hospital d on a.HisID=d.HisID"
                     + " left join Users e on e.UserID=d.UserID"
                     + " where 1=1 {0}", swhere);
            DataTable dt1 = op.ExecuteDataTable(count, CommandType.Text, null);
            dt.Columns.Add("pagecount", typeof(string));
            foreach (DataRow dr in dt.Rows)
                dr["pagecount"] = dt1.Rows[0]["c"];
            return JsonConvert.SerializeObject(dt);
        }

        //获取病例信息
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "Case?ConsultID={ConsultID}&UserID={UserID}")]
        public string GetCaseInfo(string ConsultID, string UserID)
        {
            string sql = string.Format("select b.*,d.*,ConsultTime,c.Diagnosis,c.Diagnosis_Remark,c.RecheckReturn,"
                    + "(select count(1) from Slide where ConsultID=" + ConsultID + " ) as slidecount, "
                    + "(select count(1) from Annex where ConsultID=" + ConsultID + " ) as annexcount,"
                    + "(select Diagnosis from Draft where ConsultID=" + ConsultID + " ) as DraftDiagnosis,"
                    + "(select Diagnosis_Remark from Draft where ConsultID=" + ConsultID + " ) as DraftDiagnosis_Remark,"
                      + "(select 1 from Collect where ConsultID=" + ConsultID + " and  UserID=" + UserID + " ) as IsCollect,"
                        + "(select Reason from Invite where ConsultID=" + ConsultID + " and  ToExpID=" + UserID + " ) as InviteReason,"
                          + "(select Diagnosis from Invite where ConsultID=" + ConsultID + " and  ToExpID=" + UserID + " ) as DiagnosisReason "
                    + " from Consultation a left join cases b on a.ConsultID=b.ConsultID"
                    + " left join  Diagnosis c on c.ConsultID=a.ConsultID"
                    + " left join Hospital d on a.HisID=d.HisID"
                    + " left join Users e on e.UserID=d.UserID where a.ConsultID=" + ConsultID);
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            return JsonConvert.SerializeObject(dt);
        }



        //获取留言
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "Message?ConsultID={ConsultID}")]
        public string GetMessageInfo(string ConsultID)
        {
            string sql = string.Format("select a.*,b.RoleID from Message a left join Users b on a.UserID=b.UserID where ConsultID=" + ConsultID);
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            return JsonConvert.SerializeObject(dt);
        }

        //登录
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "Login?username={username}&password={password}")]
        public string Login(string username, string password)
        {
            string sql = string.Format("select * from Users where UserName='" + username + "' and Password='" + password + "'");
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);

          //  HttpSessionState session = HttpContext.Current.Session;
            dt.Columns.Add("ver", typeof(string));
            foreach (DataRow dr in dt.Rows)
            {
                dr["ver"] = ConfigurationManager.AppSettings["Ver"];
                //Console.WriteLine(dr["id"]);
            }             
            if (dt.Rows.Count > 0)
            {
                //session['username'] = dt[0]['username'];
               
                return JsonConvert.SerializeObject(dt);
            }
            else
            {
                return "0";
            }
           
        }



        //修改密码
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "ChangePassword?userid={userid}&password={password}&password1={password1}")]
        public string ChangePassword(string userid, string password, string password1)
        {
            string ret = "0";
            try
            {
                string sqlPassword = "select Password from Users where UserID='" + userid + "'";
                DataTable dtPassword = op.ExecuteDataTable(sqlPassword, CommandType.Text, null);
                string Password = dtPassword.Rows[0]["Password"].ToString();
                if (Password == password)
                {
                    string sql = string.Format("update Users set Password='" + password1 + "' where UserID='" + userid + "' and Password='" + password + "'");
                    op.ExecuteNonQuery(sql, CommandType.Text, null);
                    ret = "1";
                }
            }
            catch
            {

            }

            return ret;

        }

        //获取诊断数量
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetCount?UserID={UserID}")]
        public string GetCount(string UserID)
        {
            string sql = string.Format("select "
                + "(select count(*)  from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID where (ConsultStatusID=1 or ConsultStatusID=2) and ExpId={0}) as num1,"
                + "(select count(*)  from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID where ConsultStatusID=4 and IsDiagnosis=1 and ExpId={0}) as num2,"
                + "(select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c on b.ConsultID=c.ConsultID "
                + "where (ConsultStatusID=99 or ConsultStatusID=100 or ConsultStatusID=101) "
                + " and SBookTime IS NOT NULL and ExpId ={0}) as BookNum,"
                + "(select count(*)  from Collect where  UserID = " + UserID + ") as CollectNum,"
                + "(select ( select count(*) from Diagnosis where IsRecheck=0 and  RecheckUser={0} )) as ReviewerNum, "

                //+ "(select count(*)  from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID where  ConsultStatusID=2 and ConsultStatusID!=-77  and RecheckUser={0}) as ReviewerNum,"
                + "(select count(*) from Diagnosis a, Consultation b where a.IsDiagnosis=0 and ExpId={0} and (b.ConsultStatusID=-1 or b.ConsultStatusID=-2) and a.ConsultID=b.ConsultID ) as ReturnNum,"
                + "(select count(*) from Invite where  DiagnosisTime is null and ToExpID={0}) as InviteNumber", UserID);

            //string sql = string.Format("select * from Users where UserName='" + UserID + "'");
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            if (dt.Rows.Count > 0)
            {
                return JsonConvert.SerializeObject(dt);
            }
            else
            {
                return"0";
            }
        }

        //获取病例数量
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetNumber?UserID={UserID}")]
        public string GetNumber(string UserID)
        {
            string sql = string.Format("select"
                + "(select count(*)  from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID where (ConsultStatusID=1 or ConsultStatusID=2) and ExpId={0}) as num1,"
                + "(select count(*)  from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID where ConsultStatusID=4 and IsDiagnosis=1 and ExpId={0}) as num2,"
                + "(select count(*) from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID left join Cases c on b.ConsultID=c.ConsultID "
                + "where (ConsultStatusID=99 or ConsultStatusID=100 or ConsultStatusID=101) "
                + " and SBookTime IS NOT NULL and ExpId ={0}) as BookNum,"
                + "(select count(*) from Collect where  UserID = "+ UserID +") as CollectNum,"
                + "(select ( select count(*) from Diagnosis where IsRecheck=0 and  RecheckUser={0} )) as ReviewerNum, "

                //+ "(select count(*)  from Consultation a left join Diagnosis b on a.ConsultID=b.ConsultID where  ConsultStatusID=2 and ConsultStatusID!=-77  and RecheckUser={0}) as ReviewerNum,"
                + "(select count(*) from Diagnosis a, Consultation b where a.IsDiagnosis=0 and ExpId={0} and (b.ConsultStatusID=-1 or b.ConsultStatusID=-2) and a.ConsultID=b.ConsultID ) as ReturnNum,"
                + "(select count(*) from Invite where  DiagnosisTime is null and ToExpID={0}) as InviteNumber", UserID);

            //string sql = string.Format("select * from Users where UserName='" + UserID + "'");
            DataTable dt = op.ExecuteDataTable(sql,CommandType.Text,null);
            if (dt.Rows.Count > 0)
            {
                return JsonConvert.SerializeObject(dt);
            }
            else
            {
                return "0";
            }
        }





        //获取专家关联站点
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetSiteByExp?UserID={UserID}")]
        public string GetSiteByExp(string UserID)
        {
            string sql = "select * from Users where UserID=" + UserID;
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            string SiteId = "";
            if (dt.Rows.Count > 0)
            {
                string SiteGroup = dt.Rows[0]["SiteGroup"].ToString();
                string[] SiteGroupArr = SiteGroup.Split(',');
                for (int i = 0; i < SiteGroupArr.Length; i++)
                {
                    if (SiteGroupArr[i] != "")
                    {

                        SiteId += SiteGroupArr[i].Split('|')[1] + ",";
                    }
                }

            }
            if (SiteId != "")
                SiteId = SiteId.Substring(0, SiteId.Length - 1);
            sql = "select * from Hospital where HisID in(" + SiteId + ")";
            dt = op.ExecuteDataTable(sql, CommandType.Text, null);

            //string sql = string.Format("select * from Users where UserName='" + UserID + "'");

            if (dt.Rows.Count > 0)
            {
                return JsonConvert.SerializeObject(dt);
            }
            else
            {
                return "0";
            }

        }

        //获取退回理由
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetReturnInfo")]
        public string GetReturnInfo()
        {
            string sql = "select * from ReturnReason";
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            return JsonConvert.SerializeObject(dt);

        }

        //退回病例-短信
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "ReturnCase", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string ReturnCase(Stream s)
        {
            string ret = "0";
            string sql = "";
            var sr = new StreamReader(s);
            string text = sr.ReadToEnd();
            ReturnVo data = JsonConvert.DeserializeObject<ReturnVo>(text);
            sql = string.Format("select ConfigOpen from Configure where ConfigID=1");
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            string config = dt.Rows[0]["ConfigOpen"].ToString();
            if (config == "1" && (data.Reason == "0" || data.Reason == "1"))
            {
                sql = string.Format("update Consultation set ConsultStatusID='-2' where ConsultID={0}", data.ConsultID);
            }
            else
            {
                sql = string.Format("update Consultation set ConsultStatusID='-1' where ConsultID={0}", data.ConsultID);
            }
            op.AddCommandText(sql);
            sql = string.Format("insert into ReturnCase (ConsultID,Reason,Expain,UserID,ReturnTime) values({0},'{1}','{2}',{3},'{4}')",
                 data.ConsultID, data.Reason, data.Expain, data.UserID, DateTime.Now.ToString());

            op.AddCommandText(sql);
            op.ExecuteForTransaction();
            ret = "1";
            //短信开关
            if (ConfigurationManager.AppSettings["Sms"] == "1")
            {
                string stringcases = string.Format("select DisplayName,Case_NO from Diagnosis a left join  Consultation b on a.ConsultID=b.ConsultID  left join Users c on a.ExpId=c.UserID left join Cases d on b.ConsultID=d.ConsultID  where b.ConsultID={0}", data.ConsultID);
                DataTable cases = op.ExecuteDataTable(stringcases, CommandType.Text, null);
                string stringuser = string.Format("select Phone,HisName,a.CenterID from Consultation a left join Hospital b on a.HisID=b.HisID left join Users c on b.UserID=c.UserID   where ConsultID='{0}'", data.ConsultID);
                DataTable user = op.ExecuteDataTable(stringuser, CommandType.Text, null);

                if (config == "1")
                {

                    string wql = string.Format("select * from Users where RoleID=1 and charindex((','+CONVERT(varchar(100),'" + user.Rows[0]["CenterID"].ToString() + "')+','),(','+CenterGroup))>0");
                    DataTable Distributer = op.ExecuteDataTable(wql, CommandType.Text, null);
                    if (data.Reason == "0" || data.Reason == "1")
                    {
                        if (Distributer.Rows.Count > 0 && cases.Rows.Count > 0)
                        {
                            Sms.Message11(Distributer.Rows[0]["Phone"].ToString(), Distributer.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["Case_No"].ToString());
                        }
                    }
                    else
                    {
                        if (Distributer.Rows.Count > 0 && cases.Rows.Count > 0)
                        {
                            Sms.Message11(Distributer.Rows[0]["Phone"].ToString(), Distributer.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["Case_No"].ToString());
                        }
                        if (user.Rows.Count > 0 && cases.Rows.Count > 0)
                        {
                            Sms.Message11(user.Rows[0]["Phone"].ToString(), user.Rows[0]["HisName"].ToString(), cases.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["Case_No"].ToString());
                        }
                    }

                }
                else
                {
                    if (user.Rows.Count > 0 && cases.Rows.Count > 0)
                    {
                        Sms.Message11(user.Rows[0]["Phone"].ToString(), user.Rows[0]["HisName"].ToString(), cases.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["Case_No"].ToString());
                    }
                }
            }

            return ret;
        }

        //获取历史退回理由
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetHistoryReturnInfo?ConsultID={ConsultID}&UserID={UserID}")]
        public string GetHistoryReturnInfo(int UserID, int ConsultID)
        {
            string sql = "select a.*,b.Reason as ReasonInfo from ReturnCase a left join ReturnReason b on a.Reason=b.ID where ConsultID=" + ConsultID + " and UserID=" + UserID;
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            return JsonConvert.SerializeObject(dt);

        }

        //获取专家信息
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetExpInfo?ConsultID={ConsultID}&UserID={UserID}")]
        public string GetExpInfo(int UserID, int ConsultID)
        {

            string swhere = "";
            string sql = string.Format("select CenterID,HisID from Consultation where ConsultID=" + ConsultID + "");
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            swhere += " and charindex(CONVERT(varchar(100),'" + dt.Rows[0]["CenterID"] + "|" + dt.Rows[0]["HisID"] + "'),SiteGroup)>0 ";
            sql = string.Format("select UserID,DisplayName,Photo from Users where RoleID=2 "
               + " and UserID !='{0}' and UserID NOT IN ( Select ToExpID from Invite where ConsultID='{1}') {2}", UserID, ConsultID, swhere);
            dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            return JsonConvert.SerializeObject(dt);

        }

        //发出邀请
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "AddInvitedInfo", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string AddInvitedInfo(Stream s)
        {

            string ret = "0";
            var sr = new StreamReader(s);
            string text = sr.ReadToEnd();
            InvitedVo data = JsonConvert.DeserializeObject<InvitedVo>(text);
            string sql = "insert into Invite(ConsultID,FromExpID,InviteTime,ToExpID,Reason) Values('"
                + data.ConsultID + "','" + data.FromExpID + "','" + DateTime.Now + "','" + data.ToExpID + "','" + data.Reason + "')";
            int i = op.ExecuteNonQuery(sql, CommandType.Text, null);
            if (i > 0)
            {
                ret = "1";
            }

            return ret;
        }

        //获取邀请专家
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetinvitedInfo?ConsultID={ConsultID}&UserID={UserID}")]
        public string GetInvitedInfo(int UserID, int ConsultID)
        {
            string sql = "select *,(select DisplayName from Users where UserID=a.ToExpID) as displayname from Invite a where DiagnosisTime is not null and FromExpID=" + UserID + " and ConsultID=" + ConsultID;
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            return JsonConvert.SerializeObject(dt);
        }

        //添加留言信息
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "AddMessage", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string AddMessage(Stream s)
        {

            string ret = "0";
            var sr = new StreamReader(s);
            string text = sr.ReadToEnd();
            MessageVo data = JsonConvert.DeserializeObject<MessageVo>(text);
            string sql = "insert into Message(ConsultID,Message,MessageTime,UserID) Values('"
                + data.ConsultID + "','" + data.Message + "','" + DateTime.Now + "','" + data.UserID + "')";
            int i = op.ExecuteNonQuery(sql, CommandType.Text, null);
            if (i > 0)
            {
                ret = "1";
            }

            return ret;
        }

        //获取草稿
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetDraftInfo?ConsultID={ConsultID}&UserID={UserID}")]
        public string GetDraftInfo(int UserID, int ConsultID)
        {
            string sql = "select ID,SlideID,Diagnosis ,Diagnosis_Remark,z_Mirror from Draft where ConsultID=" + ConsultID + "";
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            return JsonConvert.SerializeObject(dt);
        }

        //保存草稿
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "SaveDraft", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string SaveDraft(Stream s)
        {

            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                DraftVo data = JsonConvert.DeserializeObject<DraftVo>(text);
                string sql = "select count(*) as num from Draft where ConsultID=" + data.ConsultID;

                DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);



                if (dt.Rows[0]["num"].ToString() == "0")
                {
                    sql = "insert into Draft(ConsultID,Diagnosis,DraftTime,UserID,Diagnosis_Remark, z_Mirror) Values('"
                       + data.ConsultID + "','" + data.Diagnosis + "','" + DateTime.Now + "','" + data.UserID + "','" + data.Diagnosis_Remark + "','" + data.Mirror + "')";

                }
                else
                {
                    sql = "update Draft set Diagnosis='"
                        + data.Diagnosis + "',DraftTime='" + DateTime.Now + "',Diagnosis_Remark='" + data.Diagnosis_Remark
                        + "', z_Mirror='" + data.Mirror
                        + "' where  ConsultID='" + data.ConsultID + "' and UserID='" + data.UserID + "'";

                }
                op.AddCommandText(sql);
                sql = "update Cases set z_Mirror='" + data.Mirror + "' where ConsultID=" + data.ConsultID;
                op.AddCommandText(sql);
                op.ExecuteForTransaction();
                ret = "1";
            }
            catch
            {

            }


            return ret;
        }

        //获取复核专家
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetReviewExpert?ConsultID={ConsultID}&UserID={UserID}")]
        public string GetReviewExpert(string ConsultID, string UserID)
        {


            string swhere = "";

            string s1 = string.Format("select CenterID,HisID from Consultation where ConsultID=" + ConsultID + "");
            DataTable dt = op.ExecuteDataTable(s1, CommandType.Text, null);
            swhere += " and charindex(CONVERT(varchar(100),'" + dt.Rows[0]["CenterID"] + "|" + dt.Rows[0]["HisID"] + "'),SiteGroup)>0 ";

            string sql = string.Format("select UserID,DisplayName,Photo,Phone,CenterGroup,"
                + " (select CenterName from Center where CenterID=" + dt.Rows[0]["CenterID"] + ") as CenterName"
                + " from Users where RoleID=2 "
                + "and charindex(CONVERT(varchar(100),'1'),(select FnID from RoleType where ID=RoleType) )>0 "
                + " and UserID !='{0}' and UserID NOT IN ( Select ToExpID from Invite where ConsultID='{1}') {2}", UserID, ConsultID, swhere);
            DataTable ExpList = op.ExecuteDataTable(sql, CommandType.Text, null);
            ExpList.Columns.Add(new DataColumn("expcenter"));
            for (int i = 0; i < ExpList.Rows.Count; i++)
            {
                string expcenter = ExpList.Rows[i]["CenterGroup"].ToString();
                string[] expcenterarr = expcenter.Split(',');
                string expcenterstr = "";
                for (int j = 0; j < expcenterarr.Length; j++)
                {
                    if (expcenterarr[j] != "")
                    {
                        sql = "select CenterName from Center where CenterID=" + expcenterarr[j] + "";
                        DataTable dt3 = op.ExecuteDataTable(sql, CommandType.Text, null);

                        expcenterstr += dt3.Rows[0]["CenterName"].ToString() + ",";
                    }
                }
                if (expcenterstr != "")
                {
                    expcenterstr = expcenterstr.Substring(0, expcenterstr.Length - 1);
                }
                ExpList.Rows[i]["expcenter"] = expcenterstr;
            }
            return JsonConvert.SerializeObject(ExpList);

        }

        //提交复核专家-短信
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "ReviewReport", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string ReviewReport(Stream s)
        {

            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                ReviewVo data = JsonConvert.DeserializeObject<ReviewVo>(text);
                string ExpID = data.UserID;
                string ConsultID = data.ConsultID;
                string TextDiagnosis = HttpUtility.UrlDecode(data.Diagnosis);
                string Diagnosis_Remark = HttpUtility.UrlDecode(data.Diagnosis_Remark);
                string z_Mirror = HttpUtility.UrlDecode(data.z_Mirror);
                string sql = string.Format("update Consultation set ConsultStatusID = 2 where ConsultID = '{0}'", ConsultID);
                op.AddCommandText(sql);
                sql = string.Format("update cases set z_Mirror = '" + z_Mirror + "' where ConsultID = '{0}'", ConsultID);
                op.AddCommandText(sql);
                sql = string.Format("update Diagnosis set RecheckUser='{0}',IsRecheck=0 , Diagnosis='{1}',DiagnosisTime='{3}',Diagnosis_Remark='{4}' where ConsultID='{2}'", ExpID, TextDiagnosis, ConsultID, DateTime.Now.ToString(), Diagnosis_Remark);
                op.AddCommandText(sql);
                op.ExecuteForTransaction();
                ret = "1";
                if (ConfigurationManager.AppSettings["Sms"] == "1")
                {
                    string stringcases = string.Format("select DisplayName,Case_NO,CenterID from Diagnosis a left join  Consultation b on a.ConsultID=b.ConsultID  left join Users c on a.ExpId=c.UserID left join Cases d on b.ConsultID=d.ConsultID  where b.ConsultID={0}", ConsultID);
                    DataTable cases = op.ExecuteDataTable(stringcases, CommandType.Text, null);
                    string stringuser = string.Format("select Phone,DisplayName from Users where UserID={0}", ExpID);
                    DataTable user = op.ExecuteDataTable(stringuser, CommandType.Text, null);

                    if (cases.Rows.Count > 0 && user.Rows.Count > 0)
                    {
                        Sms.Message12(user.Rows[0]["Phone"].ToString(), user.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["Case_No"].ToString());
                    }
                }
            }
            catch
            {

            }


            return ret;
        }

        //撤销复核
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "CancelReviewReport", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string CancelReviewReport(Stream s)
        {

            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                ReviewVo data = JsonConvert.DeserializeObject<ReviewVo>(text);
                string ConsultID = data.ConsultID;
                string sql = string.Format("select * from Diagnosis where ConsultID=" + ConsultID + "");
                DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
                if (dt.Rows.Count > 0)
                {
                    if (dt.Rows[0]["IsRecheck"].ToString() == "1")
                    {
                        return "2";
                    }
                    else
                    {
                        try
                        {
                            sql = string.Format("update Consultation set ConsultStatusID=1 where ConsultID='{0}'", ConsultID);
                            op.AddCommandText(sql);
                            // 删除isDiagnosis = null 的操作修改 2017/5/17 
                            sql = string.Format("update Diagnosis set RecheckUser=NUll,IsRecheck=NULL ,DiagnosisTime=NUll where ConsultID='{0}'", ConsultID);
                            op.AddCommandText(sql);
                            op.ExecuteForTransaction();
                            ret = "1";
                        }
                        catch
                        {

                        }

                    }
                }

            }
            catch
            {

            }


            return ret;
        }

        //签发报告-短信
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "DiagnosisReport", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string DiagnosisReport(Stream s)
        {

            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                DiagnosisVo data = JsonConvert.DeserializeObject<DiagnosisVo>(text);
                string ConsultID = data.ConsultID;
                string TextDiagnosis = HttpUtility.UrlDecode(data.TextDiagnosis);
                string Diagnosis_Remark = HttpUtility.UrlDecode(data.Diagnosis_Remark);
                try
                {
                    string sql = string.Format("update Diagnosis set Diagnosis='{0}',IsDiagnosis=1,DiagnosisTime='{2}',Diagnosis_Remark='{3}' where ConsultID={1}",
                        TextDiagnosis, ConsultID, DateTime.Now, Diagnosis_Remark);
                    op.AddCommandText(sql);
                    sql = string.Format("update Consultation set ConsultStatusID=4,IsPublisher='{1}' where ConsultID={0}", ConsultID, 1);
                    op.AddCommandText(sql);
                    op.ExecuteForTransaction();
                    ret = "1";
                    //发短信开关
                    if (ConfigurationManager.AppSettings["Sms"] == "1")
                    {
                        //专家直接发布1
                        if (ConfigurationManager.AppSettings["IsPublisher"] == "1")
                        {
                            string stringcases = string.Format("select DisplayName,Case_NO from Diagnosis a left join  Consultation b on a.ConsultID=b.ConsultID  left join Users c on a.ExpId=c.UserID left join Cases d on b.ConsultID=d.ConsultID  where b.ConsultID={0}", ConsultID);
                            DataTable cases = op.ExecuteDataTable(stringcases, CommandType.Text, null);
                            string stringuser = string.Format("select Phone,HisName from Consultation a left join Hospital b on a.HisID=b.HisID left join Users c on b.UserID=c.UserID   where ConsultID='{0}'", ConsultID);
                            DataTable user = op.ExecuteDataTable(stringuser, CommandType.Text, null);

                            if (user.Rows.Count > 0 && cases.Rows.Count > 0)
                            {
                                Sms.Message7(user.Rows[0]["Phone"].ToString(), user.Rows[0]["HisName"].ToString(), cases.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["Case_No"].ToString());
                            }
                        }
                        //发布员发布0
                        else
                        {
                            string stringcases = string.Format("select DisplayName,Case_NO,b.CenterID from Diagnosis a left join  Consultation b on a.ConsultID=b.ConsultID  left join Users c on a.ExpId=c.UserID left join Cases d on b.ConsultID=d.ConsultID  where b.ConsultID={0}", ConsultID);
                            DataTable cases = op.ExecuteDataTable(stringcases, CommandType.Text, null);
                            string stringuser = string.Format("select TOP(1) DisplayName,Phone from Users where RoleID=7 and Enable=1 and charindex(CONVERT(varchar(100),'" + cases.Rows[0]["CenterID"].ToString() + "'+','),CenterGroup)>0 ");
                            DataTable user = op.ExecuteDataTable(stringuser, CommandType.Text, null);
                            if (user.Rows.Count > 0 && cases.Rows.Count > 0)
                            {
                                Sms.Message10(user.Rows[0]["Phone"].ToString(), user.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["Case_No"].ToString());
                            }
                        }
                    }
                }
                catch
                {

                }
            }
            catch
            {

            }


            return ret;
        }

        //收藏取消病例
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "CollectionCase", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string CollectionCase(Stream s)
        {
            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                CollectionVo data = JsonConvert.DeserializeObject<CollectionVo>(text);
                string ConsultID = data.ConsultID;
                string IsCollection = data.IsCollection;
                string UserID = data.UserID;
                try
                {
                    string sql = "";
                    if (IsCollection == "0")
                    {
                        sql = "insert into Collect(ConsultID,UserID) values(" + ConsultID + "," + UserID + ")";
                    }
                    else if (IsCollection == "1")
                    {
                        sql = "delete from Collect where ConsultID=" + ConsultID + " and UserID=" + UserID + "";

                    }
                    op.ExecuteNonQuery(sql, CommandType.Text, null);
                    ret = "1";
                }
                catch
                {

                }



            }
            catch
            {

            }


            return ret;

        }

        //撤销诊断
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "CancelDiagnosis", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string CancelDiagnosis(Stream s)
        {
            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                DiagnosisVo data = JsonConvert.DeserializeObject<DiagnosisVo>(text);
                string ConsultID = data.ConsultID;

                string sql = "select isnull(IsPublisher,0) as IsPublisher from Consultation where ConsultID=" + ConsultID;
                DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
                if (dt.Rows.Count > 0)
                {
                    string IsPublisher = dt.Rows[0]["IsPublisher"].ToString();
                    if (IsPublisher == "0")
                    {

                        sql = "update Consultation set ConsultStatusID=1 where ConsultID=" + ConsultID;
                        op.AddCommandText(sql);
                        //sql = "update Diagnosis set IsDiagnosis=0,IsRecheck=NULL,RecheckUser=NUll,RecheckTime=NULL where ConsultID=" + ConsultID;
                        // 趋撤销诊断但不撤销诊断信息
                        sql = "update Diagnosis set IsRecheck=NULL,RecheckUser=NUll,RecheckTime=NULL where ConsultID=" + ConsultID;
                        op.AddCommandText(sql);
                        op.ExecuteForTransaction();
                        ret = "1";

                    }
                    else
                    {
                        ret = "2";
                    }

                }

            }
            catch
            {

            }


            return ret;

        }

        //受邀回复
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "InvitedAsk", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string InvitedAsk(Stream s)
        {
            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                InvitedVo data = JsonConvert.DeserializeObject<InvitedVo>(text);
                int ConsultID = data.ConsultID;
                int ToExpID = data.ToExpID;
                string Diagnosis = HttpUtility.UrlDecode(data.Diagnosis);
                string DiagnosisTime = DateTime.Now.ToString();

                string sql = "update Invite set Diagnosis='" + Diagnosis + "',DiagnosisTime='"
                    + DiagnosisTime + "' where ToExpID='" + ToExpID + "' and ConsultID=" + ConsultID + "";
                int i = op.ExecuteNonQuery(sql, CommandType.Text, null); ;
                ret = "1";

            }
            catch
            {

            }


            return ret;

        }


        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "updateDiagnosis", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string updateDiagnosis(Stream s)
        {


            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                DraftVo data = JsonConvert.DeserializeObject<DraftVo>(text);
                string sql = "";
                sql = "update Diagnosis set Diagnosis='" + data.Diagnosis + "' where  ConsultID='" + data.ConsultID + "'";
                int i = op.ExecuteNonQuery(sql, CommandType.Text, null); ;
                ret = "1";

            }
            catch
            {

            }


            return ret;

        }
        //退回复核
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "BackReview", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string BackReview(Stream s)
        {
            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                DiagnosisVo data = JsonConvert.DeserializeObject<DiagnosisVo>(text);
                string ConsultID = data.ConsultID;
                string RecheckReturn = HttpUtility.UrlDecode(data.RecheckReturn);
                string sql = "update Diagnosis set  IsRecheck=-1,DiagnosisTime=NUll,RecheckReturn='" + RecheckReturn + "'  where ConsultID=" + ConsultID + "";
                int i = op.ExecuteNonQuery(sql, CommandType.Text, null); ;
                ret = "1";

            }
            catch
            {

            }
            return ret;

        }

        //复核退回理由
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "LoadReviewReturn", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string LoadReviewReturn(Stream s)
        {
            var sr = new StreamReader(s);
            string text = sr.ReadToEnd();
            DiagnosisVo data = JsonConvert.DeserializeObject<DiagnosisVo>(text);
            string ConsultID = data.ConsultID;
            // 返回回退后的诊断意见
            //string sql = "select RecheckReturn from Diagnosis where  ConsultID=" + ConsultID + "";
            string sql = "select Diagnosis, RecheckReturn from Diagnosis where  ConsultID=" + ConsultID + "";
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            return JsonConvert.SerializeObject(dt);


        }
        //复核报告-短信
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "MastReviewReport", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string MastReviewReport(Stream s)
        {
            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                DiagnosisVo data = JsonConvert.DeserializeObject<DiagnosisVo>(text);
                string ConsultID = data.ConsultID;
                // 添加一个Diagnosis数据到Diagnosis表中 2017/5/18 9:32
                string sql = string.Format("update Diagnosis set IsDiagnosis=1,IsRecheck=1,RecheckTime='{1}',Diagnosis='{2}' where ConsultID={0}", ConsultID, DateTime.Now.ToString(), data.TextDiagnosis);
                op.AddCommandText(sql);
                sql = string.Format("update Consultation set ConsultStatusID=4,IsPublisher='{1}' where ConsultID={0}", ConsultID, 1);
                op.AddCommandText(sql);
                op.ExecuteForTransaction();
                ret = "1";
                if (ConfigurationManager.AppSettings["Sms"] == "1")
                {
                    if (ConfigurationManager.AppSettings["IsPublisher"] == "1")//直接发布
                    {
                        string stringcases = string.Format("select DisplayName,Case_NO from Diagnosis a left join  Consultation b on a.ConsultID=b.ConsultID  left join Users c on a.ExpId=c.UserID left join Cases d on b.ConsultID=d.ConsultID  where b.ConsultID={0}", ConsultID);
                        DataTable cases = op.ExecuteDataTable(stringcases, CommandType.Text, null);
                        string stringuser = string.Format("select Phone,HisName from Consultation a left join Hospital b on a.HisID=b.HisID left join Users c on b.UserID=c.UserID   where ConsultID='{0}'", ConsultID);
                        DataTable user = op.ExecuteDataTable(stringuser, CommandType.Text, null);

                        if (user.Rows.Count > 0 && cases.Rows.Count > 0)
                        {

                            Sms.Message7(user.Rows[0]["Phone"].ToString(), user.Rows[0]["HisName"].ToString(), cases.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["Case_No"].ToString());
                        }
                    }
                    else
                    {
                        string stringcases = string.Format("select DisplayName,Case_NO,b.CenterID from Diagnosis a left join  Consultation b on a.ConsultID=b.ConsultID  left join Users c on a.ExpId=c.UserID left join Cases d on b.ConsultID=d.ConsultID  where b.ConsultID={0}", ConsultID);
                        DataTable cases = op.ExecuteDataTable(stringcases, CommandType.Text, null);
                        string stringuser = string.Format("select TOP(1) DisplayName,Phone from Users where RoleID=7 and Enable=1 and charindex(CONVERT(varchar(100),'" + cases.Rows[0]["CenterID"].ToString() + "'+','),CenterGroup)>0 ");
                        DataTable user = op.ExecuteDataTable(stringuser, CommandType.Text, null);

                        if (user.Rows.Count > 0 && cases.Rows.Count > 0)
                        {
                            Sms.Message10(user.Rows[0]["Phone"].ToString(), user.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["Case_No"].ToString());
                        }
                    }
                }

            }
            catch
            {

            }


            return ret;

        }

        //获取预约列表
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "Book?keyword={keyword}&sdate={sdate}&edate={edate}&ConsultStatusID={ConsultStatusID}&StarPage={StarPage}&EndPage={EndPage}&HisID={HisID}&UserID={UserID}")]
        public string Book(string keyword, string sdate, string edate, string ConsultStatusID, int StarPage, int EndPage, string HisID, int UserID)
        {
            string swhere = "";
            if (HisID != "" && HisID != "0")
            {
                swhere += " and b.HisID=" + HisID;
            }
            if (ConsultStatusID != "")
            {
                swhere += " and b.ConsultStatusID=" + ConsultStatusID;
            }
            if (keyword != "")
            {
                swhere += " and ( YuName like '%" + keyword + "%')";
            }
            if (sdate != "" && edate != "")
            {
                swhere += " and ConsultTime between '" + DateTime.Parse(sdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Parse(edate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (sdate == "" && edate != "")
            {
                swhere += " and ConsultTime between '1970-01-01 23:59:59' and '" + DateTime.Parse(edate).ToString("yyyy-MM-dd 23:59:59") + "'";

            }
            if (sdate != "" && edate == "")
            {
                swhere += " and ConsultTime between '" + DateTime.Parse(sdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Now.ToString("yyyy-MM-dd 23:59:59") + "'";

            }

            //swhere += " and b.HisID=c.HisID and (ConsultStatusID='99' or ConsultStatusID='100' or ConsultStatusID='101' or ConsultStatusID='4' or ConsultStatusID='1' )  and SBookTime IS NOT NULL and a.ExpId=" + UserID + " and a.ConsultID=b.ConsultID";
            swhere += " and b.HisID=c.HisID and (ConsultStatusID='99' or ConsultStatusID='100' or ConsultStatusID='101')  and SBookTime IS NOT NULL and a.ExpId=" + UserID + " and a.ConsultID=b.ConsultID";
            string sql = "";
            sql = string.Format("select * from(select ROW_NUMBER() OVER (order by b.ConsultID DESC) as RowNumber,b.HisID,c.HisName,b.ConsultID,b.ConsultStatusID,"
            + "ConsultTime,b.YuName,b.YuPhone,b.YuDoctor,b.YuSex,b.YuAge,"
        
               + "ConsultNo,BookContent,convert(varchar(255),SBookTime,120) as BookTime,OperationPart"
            + " from Diagnosis a,Consultation b,Hospital c where 1=1  {0}) A "
            + " where RowNumber between {1} and {2} ", swhere, StarPage, EndPage);
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);

            // + "(select count(1) from Consultation where 1 = 1 {0}) as pagecount,"

            // 获取预约总数
            string getCount = string.Format("select count(1) as pagecount from Diagnosis a,Consultation b,Hospital c where 1 = 1 {0}", swhere);
            DataTable dt1 = op.ExecuteDataTable(getCount, CommandType.Text, null);
            dt.Columns.Add("pagecount", typeof(string));
            foreach (DataRow dr in dt.Rows)
                dr["pagecount"] = dt1.Rows[0]["pagecount"];

            if (dt.Rows.Count > 0)
            {
                return JsonConvert.SerializeObject(dt);
            }
            else
            {
                return "0";
            }


        }

        //预约确认-短信
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "ConfirmBook", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string ConfirmBook(Stream s)
        {
            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                BookVo data = JsonConvert.DeserializeObject<BookVo>(text);
                string ConsultID = data.ConsultID;
                string sql = string.Format("update Consultation set ConsultStatusID=100 where ConsultID={0}", ConsultID);
                op.ExecuteNonQuery(sql, CommandType.Text, null);

                ret = "1";
                if (ConfigurationManager.AppSettings["Sms"] == "1")//发短信开关
                {
                    string stringcases = string.Format("select YuName, SBookTime, OperationPart ,DisplayName from Diagnosis a left join  Consultation b on a.ConsultID=b.ConsultID left join Users c on a.ExpId=c.UserID where b.ConsultID={0}", ConsultID);
                    DataTable cases = op.ExecuteDataTable(stringcases, CommandType.Text, null);
                    string stringuser = string.Format("select Phone,HisName from Consultation a left join Hospital b on a.HisID=b.HisID left join Users c on b.UserID=c.UserID   where ConsultID='{0}'", ConsultID);
                    DataTable user = op.ExecuteDataTable(stringuser, CommandType.Text, null);
                    Sms.Message8(user.Rows[0]["Phone"].ToString(), user.Rows[0]["HisName"].ToString(), cases.Rows[0]["DisplayName"].ToString(), cases.Rows[0]["YuName"].ToString(), cases.Rows[0]["SBookTime"].ToString());
                }

            }
            catch
            {

            }


            return ret;

        }

        //预约退回
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "ReturnBook", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string ReturnBook(Stream s)
        {
            string ret = "0";
            try
            {
                var sr = new StreamReader(s);
                string text = sr.ReadToEnd();
                BookVo data = JsonConvert.DeserializeObject<BookVo>(text);
                string ConsultID = data.ConsultID;
                string ReturnReason = HttpUtility.UrlDecode(data.ReturnReason);
                string sql = string.Format("update Consultation set ConsultStatusID=101 , ReturnReason='" + ReturnReason + "' where ConsultID={0}", ConsultID);
                op.ExecuteNonQuery(sql, CommandType.Text, null);

                ret = "1";

            }
            catch
            {

            }


            return ret;

        }

        //获取预约信息
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetBookInfo?ConsultID={ConsultID}")]
        public string GetBookInfo(string ConsultID)
        {
            string sql = "";
            string swhere = "  and b.HisID=c.HisID  and b.ConsultID=" + ConsultID;
            sql = string.Format("select b.HisID,c.HisName,b.ConsultID,b.ConsultStatusID,ReturnReason,"
            + " ConsultTime,b.YuName,b.YuPhone,b.YuDoctor,b.YuSex,b.YuAge,"
            + " ConsultNo,BookContent,convert(varchar(255),SBookTime,120) as BookTime,OperationPart"
            + " from Consultation b,Hospital c where 1=1  {0} ", swhere);
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            if (dt.Rows.Count > 0)
            {
                return JsonConvert.SerializeObject(dt);
            }
            else
            {
                return "0";
            }


        }

        //统计专家诊断数量
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetExpDiagnosticCount?ExpID={ExpID}&sdate={sdate}&edate={edate}&dsdate={dsdate}&dedate={dedate}&HisID={HisID}")]
        public string GetExpDiagnosticCount(string ExpID, string sdate, string edate, string dsdate, string dedate, string HisID)
        {
            string sql = "";
            string swhere = "";
            if (HisID != "" && HisID != "0")
            {
                swhere += " and m.HisID=" + HisID;
            }

            if (sdate != "" && edate != "")
            {
                swhere += " and ConsultTime between '" + DateTime.Parse(sdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Parse(edate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (sdate == "" && edate != "")
            {
                swhere += " and ConsultTime between '1970-01-01 23:59:59' and '" + DateTime.Parse(edate).ToString("yyyy-MM-dd 23:59:59") + "'";

            }
            if (sdate != "" && edate == "")
            {
                swhere += " and ConsultTime between '" + DateTime.Parse(sdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Now.ToString("yyyy-MM-dd 23:59:59") + "'";

            }

            if (dsdate != "" && dedate != "")
            {
                swhere += " and DiagnosisTime between '" + DateTime.Parse(dsdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Parse(dedate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (dsdate == "" && dedate != "")
            {
                swhere += " and DiagnosisTime between '1970-01-01 23:59:59' and '" + DateTime.Parse(dedate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (dsdate != "" && dedate == "")
            {
                swhere += " and DiagnosisTime between '" + DateTime.Parse(dsdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Now.ToString("yyyy-MM-dd 23:59:59") + "'";
            }

            sql = "  select distinct n.HisName,"
            + " (select count(*)  from Consultation a left join Diagnosis b on a.ConsultID = b.ConsultID where (ConsultStatusID = 1 or ConsultStatusID = 2) and ExpId = p.ExpId and HisID = m.HisID and IsDiagnosis = 0" + swhere + ") as num1,"
            + " (select count(*)  from Consultation a left join Diagnosis b on a.ConsultID = b.ConsultID where ConsultStatusID = 4 and IsDiagnosis = 1 and ExpId = p.ExpId and HisID = m.HisID" + swhere + ") as num2,"
            + " (select count(*) from Consultation a left join Diagnosis b on a.ConsultID = b.ConsultID  where IsDiagnosis = 0 and(a.ConsultStatusID = -1 or a.ConsultStatusID = -2) and ExpId = p.ExpId and HisID = m.HisID " + swhere + ") as num3,"
            + "  (select sum(ChargeMoney)  from Consultation a left join Diagnosis b on a.ConsultID = b.ConsultID left  join Charge c on c.ID = a.MoneyID"
            + "   where ExpId = p.ExpId and HisID = m.HisID and ConsultStatusID = 4 and IsDiagnosis = 1 " + swhere + ") as num4"
            + " from Consultation m "
            + " left join Hospital n on m.HisID = n.HisID"
            + " left join Diagnosis p on p.ConsultID = m.ConsultID where ExpId =" + ExpID + swhere;
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);

            if (dt.Rows.Count > 0)
            {
                return JsonConvert.SerializeObject(dt);
            }
            else
            {
                return "0";
            }


        }

        //加载数字切片
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetSlideDataMode?ConsultID={ConsultID}")]
        public string GetSlideDataMode(string ConsultID)
        {

            List<SlidePathVo> _list = new List<SlidePathVo>();
            string sql = "select * from Slide where ConsultID='" + ConsultID + "' order by UpTime,RanSe desc";
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                FileInfo fileInfo = new FileInfo(dt.Rows[i]["Client_Slide_Path"].ToString());
                SlidePathVo _SlidePathVo = new SlidePathVo();
                _SlidePathVo.Path = dt.Rows[i]["SerPath"].ToString() + dt.Rows[i]["FilePath"].ToString();
                _SlidePathVo.SlideName = dt.Rows[i]["SlideName"].ToString();
                string ReName = dt.Rows[i]["ReName"].ToString();
                if (ReName.Trim() == "")
                {
                    ReName = dt.Rows[i]["SlideName"].ToString();
                }
                if (!System.IO.File.Exists(_SlidePathVo.Path))
                {
                    if (fileInfo.Extension != ".kfb")
                        _SlidePathVo.Path = dt.Rows[i]["SerPath"].ToString() + "\\" + ConsultID + "\\Annex\\" + dt.Rows[i]["SlideName"].ToString() + "\\1.mds";
                }
                _SlidePathVo.ReName = ReName;
                _SlidePathVo.RanSe = dt.Rows[i]["RanSe"].ToString();
                _SlidePathVo.CaseNo = dt.Rows[i]["CaseNo"].ToString();
                _SlidePathVo.ClientPath = dt.Rows[i]["Client_Slide_Path"].ToString();
                string UncIp = dt.Rows[i]["UncIp"].ToString();
                string UncUserName = dt.Rows[i]["UncUserName"].ToString();
                string UncPassWord = dt.Rows[i]["UncPassWord"].ToString();
                string UncToken = "";
                if (UncIp != "" && UncUserName != "" && UncPassWord != "")
                {
                    string Token = "{\"ip\":\"" + UncIp + "\",\"username\":\"" + UncUserName + "\",\"password\":\"" + UncPassWord + "\"}";
                    string val = ConfigurationManager.AppSettings["UncTokenKey"].ToString();
                    UncToken = Convert.ToBase64String(Des3.Des3EncodeECB(val, Token));

                }

                _SlidePathVo.UncToken = UncToken;
                string status = "0";
                if (_SlidePathVo.Path.IndexOf("\\") == 0)
                {

                    IdentityScope iss = new IdentityScope(UncUserName, UncPassWord, UncIp);
                }
                if (_SlidePathVo.Path.StartsWith("http://"))
                {
                    _SlidePathVo.Path = _SlidePathVo.Path.Replace("\\", "/");
                    bool f = IsExist(_SlidePathVo.Path);
                    if (f == true)
                    {
                        status = "1";
                    }
                }
                else
                {
                    if (File.Exists(_SlidePathVo.Path))
                    {
                        status = "1";
                    }
                }
                _SlidePathVo.Status = status;
                _list.Add(_SlidePathVo);

            }
            return JsonConvert.SerializeObject(_list);


        }

        //加载附件
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetAnnexDataMode?ConsultID={ConsultID}")]
        public string GetAnnexDataMode(string ConsultID)
        {

            List<AnnexOneVo> _list = new List<AnnexOneVo>();
            string sql = "select * from Annex where ConsultID='" + ConsultID + "'";
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);

            for (int i = 0; i < dt.Rows.Count; i++)
            {
                AnnexOneVo _AnnexOneVo = new AnnexOneVo();
                _AnnexOneVo.Path = dt.Rows[i]["SerPath"].ToString() + dt.Rows[i]["FilePath"].ToString();
                // _AnnexOneVo.Path = AnnexPath + "\\" + ConsultID + "\\Annex\\" + dt.Rows[i]["AnnexName"].ToString();
                _AnnexOneVo.AnnexName = dt.Rows[i]["AnnexName"].ToString();
                _AnnexOneVo.ClientPath = dt.Rows[i]["Client_Annex_Path"].ToString();
                _AnnexOneVo.AnnexType = dt.Rows[i]["AnnexType"].ToString();

                string UncIp = dt.Rows[i]["UncIp"].ToString();
                string UncUserName = dt.Rows[i]["UncUserName"].ToString();
                string UncPassWord = dt.Rows[i]["UncPassWord"].ToString();
                string UncToken = "";
                if (UncIp != "" && UncUserName != "" && UncPassWord != "")
                {
                    string Token = "{\"ip\":\"" + UncIp + "\",\"username\":\"" + UncUserName + "\",\"password\":\"" + UncPassWord + "\"}";
                    string val = ConfigurationManager.AppSettings["UncTokenKey"].ToString();
                    UncToken = Convert.ToBase64String(Des3.Des3EncodeECB(val, Token));

                }

                _AnnexOneVo.UncToken = UncToken;

                string status = "0";
                if (_AnnexOneVo.Path.IndexOf("\\") == 0)
                {

                    IdentityScope iss = new IdentityScope(UncUserName, UncPassWord, UncIp);
                }

                if (_AnnexOneVo.Path.StartsWith("http://"))
                {
                    _AnnexOneVo.Path = _AnnexOneVo.Path.Replace("\\", "/");
                    bool f = IsExist(_AnnexOneVo.Path);
                    if (f == true)
                    {
                        status = "1";
                    }
                }
                else
                {
                    if (File.Exists(_AnnexOneVo.Path))
                    {
                        status = "1";
                    }
                }
                //if (File.Exists(_AnnexOneVo.Path))
                //{
                //    status = "1";
                //}
                _AnnexOneVo.Status = status;
                _list.Add(_AnnexOneVo);

            }
            return JsonConvert.SerializeObject(_list);



        }










        public static bool IsExist(string uri)
        {
            HttpWebRequest req = null;
            HttpWebResponse res = null;
            try
            {
                req = (HttpWebRequest)WebRequest.Create(uri);
                req.Method = "HEAD";
                req.Timeout = 2000;
                res = (HttpWebResponse)req.GetResponse();
                return (res.StatusCode == HttpStatusCode.OK);
            }
            catch
            {
                return false;
            }
            finally
            {
                if (res != null)
                {
                    res.Close();
                    res = null;
                }
                if (req != null)
                {
                    req.Abort();
                    req = null;
                }
            }
        }
        public string GetClientSlidePath(string url)
        {

            string str = "";
            try
            {
                //string url = DNTRequest.GetString("url");
                CNNWebClient _WebClient = new CNNWebClient();
                //_WebClient.Timeout = 1;
                _WebClient.Encoding = System.Text.Encoding.UTF8;//定义对象语言

                str = _WebClient.DownloadString(url);
                return str;
            }
            catch
            {
                return "-1";
            }


        }
        //传入参数是文件夹路径
        private string[] GetFiles(string folder)
        {
            string[] files2 = null;
            if (Directory.Exists(folder))
            {
                DirectoryInfo fileDirectory = new DirectoryInfo(folder);
                //文件夹及子文件夹下的所有文件的全路径
                // files = Directory.GetFiles(folder, "*.kfb", SearchOption.AllDirectories);

                FileInfo[] files = new string[] { "*.ndpi", "*.kfb", "*.mrxs", "*.svs" }
                   .SelectMany(i => fileDirectory.GetFiles(i, SearchOption.TopDirectoryOnly))
                   .Distinct().ToArray();
                files2 = new string[files.Length];

                for (int i = 0; i < files.Length; i++)
                {
                    files2[i] = Path.GetFileName(files[i].FullName);//只取后缀
                }
                return files2;
            }
            else
            {
                return files2;
            }
        }
    }


}
