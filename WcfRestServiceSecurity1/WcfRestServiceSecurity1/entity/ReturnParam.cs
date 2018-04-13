using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MoblieRestService.entity
{
    public class ReturnParam
    {
        private string consultId;
        private string reason;
        private int isDis;



        public string ConsultId
        {
            get { return consultId; }
            set { consultId = value; }
        }        

        public string Reason
        {
            get { return reason; }
            set { reason = value; }
        }

        public int IsDis
        {
            get { return isDis; }
            set { isDis = value; }
        }
    }
}