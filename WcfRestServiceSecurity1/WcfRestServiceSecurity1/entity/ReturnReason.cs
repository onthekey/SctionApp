using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

using Newtonsoft.Json;

namespace MoblieRestService.entity
{
    public class ReturnReason
    {
        private int rowNum;
        private int consultId;
        private int userId;
        private string reason;
        private string expain;
        private string returnTime;

        [XmlElement("RowNum", IsNullable = true)]
        [JsonPropertyAttribute("RowNum")]
        public int RowNum
        {
            get { return rowNum; }
            set { rowNum = value; }
        }

        [XmlElement("ConsultId", IsNullable = true)]
        [JsonPropertyAttribute("ConsultId")]
        public int ConsultId
        {
            get { return consultId; }
            set { consultId = value; }
        }

        [XmlElement("UserId", IsNullable = true)]
        [JsonPropertyAttribute("UserId")]
        public int UserId
        {
            get { return userId; }
            set { userId = value; }
        }

        [XmlElement("Reason", IsNullable = true)]
        [JsonPropertyAttribute("Reason")]
        public string Reason
        {
            get { return reason; }
            set { reason = value; }
        }

        [XmlElement("Expain", IsNullable = true)]
        [JsonPropertyAttribute("Expain")]
        public string Expain
        {
            get { return expain; }
            set { expain = value; }
        }

        [XmlElement("ReturnTime", IsNullable = true)]
        [JsonPropertyAttribute("ReturnTime")]
        public string ReturnTime
        {
            get { return returnTime; }
            set { returnTime = value; }
        }
    }
}