
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.Data;
    using System.Data.SqlClient;

    public class SqlOperator
    {
        private Dictionary<string, SqlParameter[]> _cmdTextDic;
        private string _connectionString;

        public SqlOperator()
        {
            this._cmdTextDic = new Dictionary<string, SqlParameter[]>();
            this._connectionString = string.Empty;
            this._connectionString = ConfigurationManager.AppSettings["Conn"];
        }

        public SqlOperator(string ConnKey)
        {
            this._cmdTextDic = new Dictionary<string, SqlParameter[]>();
            this._connectionString = string.Empty;
            this._connectionString = ConfigurationManager.AppSettings[ConnKey];
        }

        public void AddCommandText(string cmdText)
        {
            this._cmdTextDic.Add(cmdText, null);
        }

        public void AddCommandText(string cmdText, SqlParameter[] parms)
        {
            this._cmdTextDic.Add(cmdText, parms);
        }

        public DataSet ExecuteDataSet(string cmdText, CommandType cmdType, SqlParameter[] parms)
        {
            DataSet dataSet = new DataSet();
            using (SqlConnection connection = this.GetSqlConnection)
            {
                new SqlDataAdapter(this.GetPreparedCommond(connection, cmdText, cmdType, parms)).Fill(dataSet);
            }
            return dataSet;
        }

        public DataTable ExecuteDataTable(string cmdText, CommandType cmdType, SqlParameter[] parms)
        {
            DataTable dataTable = new DataTable();
            SqlConnection getSqlConnection = this.GetSqlConnection;
            try
            {
                new SqlDataAdapter(this.GetPreparedCommond(getSqlConnection, cmdText, cmdType, parms)).Fill(dataTable);
            }
            catch
            {
            }
            finally
            {
                if (getSqlConnection != null)
                {
                    getSqlConnection.Dispose();
                }
            }
            return dataTable;
        }

        public DataTable ExecuteDataTable(string cmdText, CommandType cmdType, int startRecord, int PageSize, SqlParameter[] parms)
        {
            DataSet dataSet = new DataSet();
            using (SqlConnection connection = this.GetSqlConnection)
            {
                new SqlDataAdapter(this.GetPreparedCommond(connection, cmdText, cmdType, parms)).Fill(dataSet, startRecord, PageSize, "result");
            }
            return dataSet.Tables["result"];
        }

        public void ExecuteForTransaction()
        {
            if (this._cmdTextDic.Count > 0)
            {
                using (SqlConnection connection = this.GetSqlConnection)
                {
                    connection.Open();
                    SqlTransaction transaction = connection.BeginTransaction();
                    SqlCommand command = new SqlCommand();
                    command.Connection = connection;
                    command.Transaction = transaction;
                    command.CommandType = CommandType.Text;
                    try
                    {
                        foreach (KeyValuePair<string, SqlParameter[]> pair in this._cmdTextDic)
                        {
                            command.CommandText = pair.Key;
                            if (pair.Value != null)
                            {
                                command.Parameters.AddRange(pair.Value);
                            }
                            command.ExecuteNonQuery();
                        }
                        transaction.Commit();
                    }
                    catch (Exception exception)
                    {
                        transaction.Rollback();
                        throw exception;
                    }
                }
                this._cmdTextDic.Clear();
            }
        }

        public int ExecuteNonQuery(string cmdText, CommandType cmdType, SqlParameter[] parms)
        {
            int num;
            using (SqlConnection connection = this.GetSqlConnection)
            {
                connection.Open();
                SqlCommand command = this.GetPreparedCommond(connection, cmdText, cmdType, parms);
                try
                {
                    num = command.ExecuteNonQuery();
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }
            return num;
        }

        public object ExecuteScalar(string cmdText, CommandType cmdType, SqlParameter[] parms)
        {
            using (SqlConnection connection = this.GetSqlConnection)
            {
                connection.Open();
                return this.GetPreparedCommond(connection, cmdText, cmdType, parms).ExecuteScalar();
            }
        }

        public int GetIntID(string strTable, string strField)
        {
            SqlParameter[] parms = new SqlParameter[] { new SqlParameter("@table", SqlDbType.VarChar, 0xff), new SqlParameter("@Field", SqlDbType.VarChar, 0xff), new SqlParameter("@returnInt", SqlDbType.Int) };
            parms[0].Value = strTable;
            parms[1].Value = strField;
            parms[2].Direction = ParameterDirection.Output;
            parms[2].Value = 0;
            int num = this.ExecuteNonQuery("p_SYS_GetID", CommandType.StoredProcedure, parms);
            return Convert.ToInt32(parms[2].Value);
        }

        private SqlCommand GetPreparedCommond(SqlConnection conn, string cmdText, CommandType cmdType, SqlParameter[] parms)
        {
            if (((conn == null) || (cmdText == null)) || (cmdText == ""))
            {
                throw new Exception("SqlConnection或者CommandText不能为空");
            }
            SqlCommand command = new SqlCommand();
            command.Connection = conn;
            command.CommandText = cmdText;
            command.CommandType = cmdType;
            if (parms != null)
            {
                command.Parameters.AddRange(parms);
            }
            return command;
        }

        public string GetVarCharID(string strTable, string strField)
        {
            SqlParameter[] parms = new SqlParameter[] { new SqlParameter("@TableName", SqlDbType.VarChar, 0xff), new SqlParameter("@IDName", SqlDbType.VarChar, 0xff), new SqlParameter("@LenNum", SqlDbType.Int), new SqlParameter("@IDNew", SqlDbType.VarChar, 0xff) };
            parms[0].Value = strTable;
            parms[1].Value = strField;
            parms[2].Value = 3;
            parms[3].Direction = ParameterDirection.Output;
            parms[3].Value = "";
            int num = this.ExecuteNonQuery("P_Sys_GetVarCharID", CommandType.StoredProcedure, parms);
            return parms[3].Value.ToString();
        }

        public string GetVarCharID(string strTable, string strField, string LenNum)
        {
            SqlParameter[] parms = new SqlParameter[] { new SqlParameter("@TableName", SqlDbType.VarChar, 0xff), new SqlParameter("@IDName", SqlDbType.VarChar, 0xff), new SqlParameter("@LenNum", SqlDbType.Int), new SqlParameter("@IDNew", SqlDbType.VarChar, 0xff) };
            parms[0].Value = strTable;
            parms[1].Value = strField;
            parms[2].Value = LenNum;
            parms[3].Direction = ParameterDirection.Output;
            parms[3].Value = "";
            int num = this.ExecuteNonQuery("P_Sys_GetVarCharID", CommandType.StoredProcedure, parms);
            return parms[3].Value.ToString();
        }

        public bool PublicSave(string strXml)
        {
            SqlParameter[] parms = new SqlParameter[] { new SqlParameter("@chrXML", SqlDbType.NText), new SqlParameter("@iBool", SqlDbType.Int) };
            parms[0].Value = strXml;
            parms[1].Direction = ParameterDirection.Output;
            parms[1].Value = 0;
            this.ExecuteNonQuery("p_SYS_PublicSave", CommandType.StoredProcedure, parms);
            return Convert.ToBoolean(parms[1].Value);
        }

        public string ConnectionString
        {
            get
            {
                return this._connectionString;
            }
            set
            {
                this._connectionString = value;
            }
        }

        private SqlConnection GetSqlConnection
        {
            get
            {
                if (this._connectionString == string.Empty)
                {
                    throw new Exception("ConnectionText 连接字符串不能为空");
                }
                return new SqlConnection(this._connectionString);
            }
        }
    }


