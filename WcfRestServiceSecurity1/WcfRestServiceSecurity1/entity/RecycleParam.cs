using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MoblieRestService.entity
{
    public class RecycleParam
    {
        private int type;
        private string consultId;

        public int Type
        {
            get { return type; }
            set { type = value; }
        }

        public string ConsultId
        {
            get { return consultId; }
            set { consultId = value; }
        }
    }
}