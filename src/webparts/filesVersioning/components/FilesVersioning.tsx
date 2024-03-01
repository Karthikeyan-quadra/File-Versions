// import * as React from 'react';
// import styles from './FilesVersioning.module.scss';
// import type { IFilesVersioningProps } from './IFilesVersioningProps';
// import { escape } from '@microsoft/sp-lodash-subset';

// export default class FilesVersioning extends React.Component<IFilesVersioningProps, {}> {
//   public render(): React.ReactElement<IFilesVersioningProps> {
//     const {
//       description,
//       isDarkTheme,
//       environmentMessage,
//       hasTeamsContext,
//       userDisplayName
//     } = this.props;

//     return (
//       <section className={`${styles.filesVersioning} ${hasTeamsContext ? styles.teams : ''}`}>
//         <div className={styles.welcome}>
//           <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
//           <h2>Well done, {escape(userDisplayName)}!</h2>
//           <div>{environmentMessage}</div>
//           <div>Web part property value: <strong>{escape(description)}</strong></div>
//         </div>
//         <div>
//           <h3>Welcome to SharePoint Framework!</h3>
//           <p>
//             The SharePoint Framework (SPFx) is a extensibility model for Microsoft Viva, Microsoft Teams and SharePoint. It&#39;s the easiest way to extend Microsoft 365 with automatic Single Sign On, automatic hosting and industry standard tooling.
//           </p>
//           <h4>Learn more about SPFx development:</h4>
//           <ul className={styles.links}>
//             <li><a href="https://aka.ms/spfx" target="_blank" rel="noreferrer">SharePoint Framework Overview</a></li>
//             <li><a href="https://aka.ms/spfx-yeoman-graph" target="_blank" rel="noreferrer">Use Microsoft Graph in your solution</a></li>
//             <li><a href="https://aka.ms/spfx-yeoman-teams" target="_blank" rel="noreferrer">Build for Microsoft Teams using SharePoint Framework</a></li>
//             <li><a href="https://aka.ms/spfx-yeoman-viva" target="_blank" rel="noreferrer">Build for Microsoft Viva Connections using SharePoint Framework</a></li>
//             <li><a href="https://aka.ms/spfx-yeoman-store" target="_blank" rel="noreferrer">Publish SharePoint Framework applications to the marketplace</a></li>
//             <li><a href="https://aka.ms/spfx-yeoman-api" target="_blank" rel="noreferrer">SharePoint Framework API reference</a></li>
//             <li><a href="https://aka.ms/m365pnp" target="_blank" rel="noreferrer">Microsoft 365 Developer Community</a></li>
//           </ul>
//         </div>
//       </section>
//     );
//   }
// }


import * as React from "react";
import { useEffect, useState } from "react";
import { Button, Table, Popover, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  getAllFilesInFolder,
  getFileVersionHistory,
  UploadFile,
} from "../service/spservice";
import type { IFilesVersioningProps } from "./IFilesVersioningProps";
import styles from "./FilesVersioning.module.scss";
import 'antd/dist/reset.css';

const FilesVersioning = (props: IFilesVersioningProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [versionHistories, setVersionHistories] = useState<{
    [key: string]: any[];
  }>({});
  const [popoverVisible, setPopoverVisible] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const files: any = await getAllFilesInFolder("DocumentsUploaded");
      setFiles(files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFileChange = (info: any) => {
    const file = info.file.originFileObj;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    try {
      if (selectedFile) {
        await UploadFile(selectedFile, "DocumentsUploaded");
        await fetchFiles();
        message.success("File Uploaded Successfully!");
      } else {
        console.warn("No file selected for upload");
        message.error("Error Uploading File");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    }
  };

  const handleFileVersionHistory = async (
    fileUniqueId: string,
    record: any
  ) => {
    try {
      const history = await getFileVersionHistory(fileUniqueId);
      setVersionHistories({ ...versionHistories, [fileUniqueId]: history });
      setPopoverVisible({ ...popoverVisible, [fileUniqueId]: true });
    } catch (error) {
      console.error("Error fetching file version history:", error);
    }
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "Name",
      key: "Name",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (key: any, record: any) => (
        <Popover
          content={
            <Table
              dataSource={versionHistories[record.UniqueId]}
              columns={[
                {
                  title: "Version",
                  dataIndex: "versionNumber",
                  key: "versionNumber",
                },
                // {
                //   title: "Modified By",
                //   dataIndex: "modifiedBy",
                //   key: "modifiedBy",
                // },
                {
                  title: "Modified Date",
                  dataIndex: "modifiedDate",
                  key: "modifiedDate",
                },
                {
                  title: "Modified Time",
                  dataIndex: "modifiedTime",
                  key: "modifiedDate",
                },
                // { title: "Size", dataIndex: "size", key: "size" },
              ]}
              pagination={false}
            />
          }
          trigger="click"
          visible={popoverVisible[record.UniqueId]}
          onVisibleChange={(visible) =>
            setPopoverVisible({ ...popoverVisible, [record.UniqueId]: visible })
          }
        >
          <Button
            onClick={() => handleFileVersionHistory(record.UniqueId, record)}
          >
            View Version History
          </Button>
        </Popover>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* <div style={{ display: "none" }}>
        <div className={styles.heading}>File Upload</div>
        <div style={{ margin: "20px 0" }}>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
        </div>
      </div> */}

      <div className={styles.card}>
        <div className={styles.heading}>File Upload</div>
        <div className={styles.contentBox}>
          <img
            src={require("../assets/server.png")}
            alt="Upload Img"
            className={styles.uploadImg}
          />
          <p className={styles.text}>
            upload your{" "}
            <span style={{ fontWeight: "600", textDecoration: "underline" }}>
              files
            </span>{" "}
            to cloud
          </p>
        </div>
        <div className={styles.inputs}>
          <Upload
            customRequest={handleUpload}
            showUploadList={false}
            onChange={handleFileChange}
          >
            <Button
              icon={<UploadOutlined rev={undefined} />}
              style={{ marginTop: "15px" }}
            >
              Upload
            </Button>
          </Upload>
        </div>
      </div>

      <div className={styles.heading}>Folders in DocumentsUploaded</div>
      <Table
        dataSource={files}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default FilesVersioning;

//Explanation
// Import necessary modules and components from the React and Ant Design libraries
// import * as React from "react";
// import { useEffect, useState } from "react";
// import { Button, Table, Popover, Upload, message } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import {
//   getAllFilesInFolder,
//   getFileVersionHistory,
//   UploadFile,
// } from "../service/spservice"; // Import functions from a service file
// import type { IFilesVersioningProps } from "./IFilesVersioningProps"; // Import a type definition
// import styles from "./FilesVersioning.module.scss"; // Import styles for the component
// import 'antd/dist/reset.css'; // Import Ant Design reset styles

// // Define the functional component FilesVersioning
// const FilesVersioning = (props: IFilesVersioningProps) => {
//   // Declare state variables using the useState hook
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [files, setFiles] = useState<any[]>([]);
//   const [versionHistories, setVersionHistories] = useState<{ [key: string]: any[] }>({});
//   const [popoverVisible, setPopoverVisible] = useState<{ [key: string]: boolean }>({});

//   // Use the useEffect hook to fetch files when the component mounts
//   useEffect(() => {
//     fetchFiles();
//   }, []);

//   // Define the asynchronous function to fetch files
//   const fetchFiles = async () => {
//     try {
//       const files: any = await getAllFilesInFolder("DocumentsUploaded");
//       setFiles(files);
//     } catch (error) {
//       console.error("Error fetching files:", error);
//     }
//   };

//   // Define a function to handle file change when using the Upload component
//   const handleFileChange = (info: any) => {
//     const file = info.file.originFileObj;
//     setSelectedFile(file);
//   };

//   // Define a function to handle file upload
//   const handleUpload = async () => {
//     try {
//       if (selectedFile) {
//         // Upload the selected file and update the files state
//         await UploadFile(selectedFile, "DocumentsUploaded");
//         await fetchFiles();
//         message.success("File Uploaded Successfully!");
//       } else {
//         console.warn("No file selected for upload");
//         message.error("Error Uploading File");
//       }
//     } catch (error) {
//       console.error("Error during file upload:", error);
//     }
//   };

//   // Define a function to handle fetching file version history
//   const handleFileVersionHistory = async (fileUniqueId: string, record: any) => {
//     try {
//       const history = await getFileVersionHistory(fileUniqueId);
//       // Update versionHistories and popoverVisible states
//       setVersionHistories({ ...versionHistories, [fileUniqueId]: history });
//       setPopoverVisible({ ...popoverVisible, [fileUniqueId]: true });
//     } catch (error) {
//       console.error("Error fetching file version history:", error);
//     }
//   };

//   // Define columns for the Ant Design Table component
//   const columns = [
//     {
//       title: "File Name",
//       dataIndex: "Name",
//       key: "Name",
//     },
//     {
//       title: "Actions",
//       dataIndex: "actions",
//       key: "actions",
//       // Render a button inside a Popover for each row in the table
//       render: (_: any, record: any) => (
//         <Popover
//           content={
//             // Display version history in a nested table inside the Popover
//             <Table
//               dataSource={versionHistories[record.UniqueId]}
//               columns={[
//                 { title: "Version", dataIndex: "versionNumber", key: "versionNumber" },
//                 // Additional columns commented out for brevity
//               ]}
//               pagination={false}
//             />
//           }
//           trigger="click"
//           visible={popoverVisible[record.UniqueId]}
//           onVisibleChange={(visible) =>
//             setPopoverVisible({ ...popoverVisible, [record.UniqueId]: visible })
//           }
//         >
//           <Button
//             onClick={() => handleFileVersionHistory(record.UniqueId, record)}
//           >
//             View Version History
//           </Button>
//         </Popover>
//       ),
//     },
//   ];

//   // Return the JSX for the component
//   return (
//     <div className={styles.container}>
//       {/* Commented out file upload section */}
//       <div className={styles.card}>
//         <div className={styles.heading}>File Upload</div>
//         <div className={styles.contentBox}>
//           {/* Display an image for file upload */}
//           <img
//             src={require("../assets/server.png")}
//             alt="Upload Img"
//             className={styles.uploadImg}
//           />
//           {/* Display text for file upload */}
//           <p className={styles.text}>
//             upload your{" "}
//             <span style={{ fontWeight: "600", textDecoration: "underline" }}>
//               files
//             </span>{" "}
//             to cloud
//           </p>
//         </div>
//         {/* Use Ant Design Upload component for file upload */}
//         <div className={styles.inputs}>
//           <Upload
//             customRequest={handleUpload}
//             showUploadList={false}
//             onChange={handleFileChange}
//           >
//             <Button
//               icon={<UploadOutlined rev={undefined} />}
//               style={{ marginTop: "15px" }}
//             >
//               Upload
//             </Button>
//           </Upload>
//         </div>
//       </div>

//       {/* Display the heading for folders */}
//       <div className={styles.heading}>Folders in DocumentsUploaded</div>
//       {/* Render the Ant Design Table component with files and columns */}
//       <Table
//         dataSource={files}
//         columns={columns}
//         pagination={{ pageSize: 5 }}
//       />
//     </div>
//   );
// };

// // Export the component as the default export
// export default FilesVersioning;
