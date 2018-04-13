using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
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
using System.Configuration;
using System.Web.SessionState;




namespace MoblieRestService
{

    [ServiceContract]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]

    public class HosService
    {

      
        SqlOperator op = new SqlOperator();


  
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




        //申请端获取病例数量
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetNumber?UserID={UserID}")]
        public string GetNumber(string UserID)
        {
            string sql = string.Format("select "
                + "(select count(*) from Users a ,Hospital c ,Consultation d where d.HisID=c.HisID and d.ConsultStatusID=0 and  a.UserID={0} and a.UserID=c.UserID ) as num1,"//草稿
                + "(select count(*) from Users a ,Hospital c ,Consultation d where d.HisID=c.HisID and d.ConsultStatusID=1 and a.UserID={0} and a.UserID=c.UserID ) as ReviewerNum,"//待诊断
                + "(select count(*) from Users a ,Hospital c ,Consultation d where d.HisID=c.HisID and d.ConsultStatusID=4 and a.UserID={0} and a.UserID=c.UserID ) as num2,"//已诊断
                + "(select count(*) from Users a ,Hospital c ,Consultation d where d.HisID=c.HisID and d.ConsultStatusID in(-1,-2) and a.UserID={0} and a.UserID=c.UserID ) as ReturnNum,"//退回
                + "(select count(*) from Users a ,Hospital c ,Consultation d where d.HisID=c.HisID and d.ConsultStatusID=-88 and a.UserID={0} and a.UserID=c.UserID ) as InviteNumber,"//撤回
                + "(select count(*) from Users a ,Hospital c ,Consultation d where d.HisID=c.HisID and (d.ConsultStatusID=99 or d.ConsultStatusID=100 or d.ConsultStatusID=101) and SBookTime IS NOT NULL and a.UserID={0} and a.UserID=c.UserID) as BookNum,"//预约
                + "( select count(*) from Message e where not exists (select 1 from Message where ConsultID=e.ConsultID and MessageID > e.MessageID ) and UserID={0} ) as CollectNum"//留言
                  , UserID);
            //string sql = string.Format("select * from Users where UserName='" + UserID + "'");
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



        //申请端获取会诊信息
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "getdata?reviewtype={reviewtype}&invitedtype={invitedtype}&keyword={keyword}&sdate={sdate}&edate={edate}&casetype={casetype}&StarPage={StarPage}&EndPage={EndPage}&HisID={HisID}&ConsultStatusID={ConsultStatusID}&UserID={UserID}")]
        public string getdata(string reviewtype, string invitedtype, string keyword, string sdate, string edate, string casetype, string StarPage, string EndPage, string HisID, string ConsultStatusID, string UserID)
        {
            string swhere = "";
            string temp = "";
            if (HisID != "" && HisID != "0")
            {
                swhere += " and d.HisID=" + HisID;
            }
            if (keyword != "")
            {
                temp += " and (Case_No like '%" + keyword + "%' or Name like '%" + keyword + "%')"; //查询病理号与姓名
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

            if (ConsultStatusID != "")
            {
                if (ConsultStatusID == "0")
                {
                    temp = " and ConsultStatusID=0 "; //草稿
                }
                else if (ConsultStatusID == "1")//待诊断
                {
                    temp = " and ConsultStatusID=1 ";
                }
                else if (ConsultStatusID == "4")//已诊断
                {
                    temp = " and ConsultStatusID=4";
                }
                else if (ConsultStatusID == "-1")//被退回
                {
                    temp = " and (ConsultStatusID=-1 or ConsultStatusID=-2)";
                }
                else if (ConsultStatusID == "-88")//撤回
                {
                    temp = " and ConsultStatusID = -88";
                }

            }
            else
            {
                temp = " and (ConsultStatusID = 0 OR ConsultStatusID = 1 OR a.ConsultStatusID = 4 OR ConsultStatusID = -1 OR  ConsultStatusID = -2 OR ConsultStatusID = -88 )";

            }


            if (ConsultStatusID != "")
            {
                if (ConsultStatusID != "99")
                {
                    swhere += temp;
                }
            }
            else if (ConsultStatusID != "99")
            {
                swhere += temp;
            }

            string sql = string.Format("select * from("
                     + "select ROW_NUMBER() OVER (order by b.ConsultID DESC) as RowNumber,"
                     + " b.*,d.*,ConsultTime,IsRecheck,ConsultStatusID,c.ExpId,"
                     + "(select DisplayName from Invite a left join Users k on k.UserID=a.FromExpID where ConsultID=b.ConsultID and ToExpID=" + UserID + ") as fromexp," //来自站点名
                //           + "(select DisplayName from Diagnosis a left join Users k on k.UserID=a.ExpID where ConsultID=b.ConsultID) as expname,"                       //专家姓名
                     + "(select 1 from Invite where ConsultID=b.ConsultID and ToExpID=" + UserID + " and DiagnosisTime is null) as isInvite"                       //已回复，未回复
                     + " from Consultation a left join cases b on a.ConsultID=b.ConsultID"
                     + " left join  Diagnosis c on c.ConsultID=a.ConsultID"
                     + " left join Hospital d on a.HisID=d.HisID"
                     + " left join Users e on e.UserID=d.UserID"
                     + " where 1=1  {2} and d.UserID ={3} ) T  where RowNumber between {0} and {1}", StarPage, EndPage, swhere, UserID);
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);

            string count = string.Format("select count(*) as c"
                + " from Consultation a left join cases b on a.ConsultID=b.ConsultID"
                     + " left join  Diagnosis c on c.ConsultID=a.ConsultID"
                     + " left join Hospital d on a.HisID=d.HisID"
                     + " left join Users e on e.UserID=d.UserID"
                     + " where 1=1 {0} and e.UserID = {1}", swhere, UserID);
            DataTable dt1 = op.ExecuteDataTable(count, CommandType.Text, null);
            dt.Columns.Add("pagecount", typeof(string));
            foreach (DataRow dr in dt.Rows)
                dr["pagecount"] = dt1.Rows[0]["c"];

            return JsonConvert.SerializeObject(dt);



        }




        //申请端获取预约列表
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "getBook?keyword={keyword}&sdate={sdate}&edate={edate}&ConsultStatusID={ConsultStatusID}&StarPage={StarPage}&EndPage={EndPage}&HisID={HisID}&UserID={UserID}")]
        public string getBook(string keyword, string sdate, string edate, string ConsultStatusID, int StarPage, int EndPage, string HisID, int UserID)
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
            swhere += " and b.HisID=c.HisID and (ConsultStatusID='99' or ConsultStatusID='100' or ConsultStatusID='101')  and SBookTime IS NOT NULL and a.UserID=" + UserID + " and a.UserID=c.UserID";
            string sql = "";
            sql = string.Format("select * from(select ROW_NUMBER() OVER (order by b.ConsultID DESC) as RowNumber,b.HisID,c.HisName,b.ConsultID,b.ConsultStatusID,"
            + "b.ConsultTime,b.YuName,b.YuPhone,b.YuDoctor,b.YuSex,b.YuAge,"

               + "ConsultNo,BookContent,convert(varchar(255),SBookTime,120) as BookTime,OperationPart"
            + " from Users a,Consultation b,Hospital c where 1=1  {0}) A "
            + " where RowNumber between {1} and {2} ", swhere, StarPage, EndPage);
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);

            // + "(select count(1) from Consultation where 1 = 1 {0}) as pagecount,"




            // 申请端获取预约总数
            string getCount = string.Format("select count(1) as c from Users a,Consultation b,Hospital c where 1 = 1 {0}", swhere);

            DataTable dt1 = op.ExecuteDataTable(getCount, CommandType.Text, null);
            dt.Columns.Add("pagecount", typeof(string));
            foreach (DataRow dr in dt.Rows)
                dr["pagecount"] = dt1.Rows[0]["c"];

          
                return JsonConvert.SerializeObject(dt);
         

        }



        //申请端预约退回
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "AppReturnBook", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Bare)]
        public string AppReturnBook(Stream s)
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

        //申请端获取预约信息
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GainBookInfo?ConsultID={ConsultID}")]
        public string GainBookInfo(string ConsultID)
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




        //申请端留言病例
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "get_message_data?StarPage={StarPage}&EndPage={EndPage}&UserID={UserID}")]
        public string get_message_data(string StarPage, string EndPage, string UserID)
        {



            string sql = string.Format("select * from("
                                    + "select ROW_NUMBER() OVER (order by d.ConsultID DESC) as RowNumber, "
                                    + "d.ConsultID,c.CaseTypeID,c.Case_No,c.Name,e.Message,e.MessageTime,b.DisplayName "
                                    + "from Hospital a,Users b ,Cases c,Consultation d,Message e "
                                    + "where a.UserID=b.UserID and b.UserID=e.UserID and d.ConsultID=e.ConsultID and a.UserID={2} and d.ConsultID=c.ConsultID and "
                                    + " not exists (select 1 from Message where ConsultID=e.ConsultID and MessageID > e.MessageID ) "
                                    + ") T  where RowNumber between {0} and {1}", StarPage, EndPage, UserID);
            DataTable dt = op.ExecuteDataTable(sql, CommandType.Text, null);



            string count = string.Format("select count(*) as pagecount from Hospital a,Users b,Cases c,Consultation d,Message e  where a.UserID=b.UserID and b.UserID=e.UserID and d.ConsultID=e.ConsultID and a.UserID={0} and d.ConsultID=c.ConsultID", UserID);

            DataTable dt1 = op.ExecuteDataTable(count, CommandType.Text, null);
            dt.Columns.Add("pagecount", typeof(string));
            foreach (DataRow dr in dt.Rows)
                dr["pagecount"] = dt1.Rows[0]["pagecount"];
            return JsonConvert.SerializeObject(dt);
        }





        //申请端统计专家诊断数量
        [WebGet(ResponseFormat = WebMessageFormat.Json, UriTemplate = "GetApplyStatisticsCount?ExpID={ExpID}&nameword={nameword}&sdate={sdate}&edate={edate}&dsdate={dsdate}&dedate={dedate}&HisID={HisID}")]
        public string GetApplyStatisticsCount(string ExpID, string nameword, string sdate, string edate, string dsdate, string dedate, string HisID)
        {
            string sql = "";
            string swhere = "";
            string sname = " ";
            if (HisID != "" && HisID != "0")
            {
                swhere += " and c1.HisID=" + HisID;
            }
            if (nameword != "")
            {
                sname += " and ( UserName like '%" + nameword + "%')";
            }
            if (sdate != "" && edate != "")
            {
                swhere += " and c1.ConsultTime between '" + DateTime.Parse(sdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Parse(edate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (sdate == "" && edate != "")
            {
                swhere += " and c1.ConsultTime between '1970-01-01 23:59:59' and '" + DateTime.Parse(edate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (sdate != "" && edate == "")
            {
                swhere += " and c1.ConsultTime between '" + DateTime.Parse(sdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Now.ToString("yyyy-MM-dd 23:59:59") + "'";
            }

            if (dsdate != "" && dedate != "")
            {
                swhere += " and d1.DiagnosisTime between '" + DateTime.Parse(dsdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Parse(dedate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (dsdate == "" && dedate != "")
            {
                swhere += " and d1.DiagnosisTime between '1970-01-01 23:59:59' and '" + DateTime.Parse(dedate).ToString("yyyy-MM-dd 23:59:59") + "'";
            }
            if (dsdate != "" && dedate == "")
            {
                swhere += " and d1.DiagnosisTime between '" + DateTime.Parse(dsdate).ToString("yyyy-MM-dd 00:00:00") + "' and '" + DateTime.Now.ToString("yyyy-MM-dd 23:59:59") + "'";
            }


            sql = "SELECT u.UserName, "
          + "(SELECT	COUNT (*) FROM Consultation c1 LEFT JOIN  Diagnosis d1 on c1.ConsultID = d1.ConsultID where c1.ConsultStatusID = 1 and d1.IsDiagnosis = 0 and ExpId = u.UserID" + swhere + sname + " ) AS num1 ," //待诊断数量
          + "(SELECT	COUNT (*) FROM Consultation c1 LEFT JOIN  Diagnosis d1 on c1.ConsultID = d1.ConsultID where c1.ConsultStatusID = 4 and d1.IsDiagnosis = 1 and ExpId = u.UserID " + swhere + sname + ") AS num2 ,"//已诊断数量
          + "(SELECT COUNT (*) FROM Consultation c1 LEFT JOIN  Diagnosis d1 on c1.ConsultID = d1.ConsultID where c1.ConsultStatusID in(-1,-2) and ExpId = u.UserID " + swhere + sname + ") AS num3 ,"//退回数量
          + "(SELECT sum(ChargeMoney) FROM Consultation c1 LEFT JOIN cases b on c1.ConsultID = b.ConsultID	LEFT JOIN Diagnosis d1 ON c1.ConsultID = d1.ConsultID LEFT JOIN Charge c on c.ID = c1.MoneyID WHERE ConsultStatusID = 4 and d1.ExpId = u.UserID " + swhere + sname + ") AS num4"//由待诊断得出总价格
          + " FROM Users u WHERE u.RoleID = 2  " + sname;




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


    }
}