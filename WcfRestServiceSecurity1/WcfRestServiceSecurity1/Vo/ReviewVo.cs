using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MoblieRestService.Vo
{
    public class ReviewVo
    {
       public string ConsultID {
            get;
            set;
        }
        public string UserID
        {
            get;
            set;
        }
        public string Diagnosis
        {
            get;
            set;
        }
        public string Diagnosis_Remark
        {
            get;
            set;
        }
        public string z_Mirror {
            get;
            set;
        }
    }
}