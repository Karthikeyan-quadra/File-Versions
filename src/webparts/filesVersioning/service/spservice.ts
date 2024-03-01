import { getSP } from "./pnpConfig";

export async function UploadFile(file: File, folderPath: string) {
  try {
    const fileNamePath: any = encodeURI(file.name);
    const decodedFileNamePath = decodeURIComponent(fileNamePath);

    const sp = getSP();
    let result: any;

    if (file.size <= 10485760) {
      // small upload
      result = await sp.web
        .getFolderByServerRelativePath(folderPath)
        .files.addUsingPath(decodedFileNamePath, file, { Overwrite: true });
    } else {
      // large upload
      result = await sp.web
        .getFolderByServerRelativePath(folderPath)
        .files.addChunked(
          decodedFileNamePath,
          file,
          (data) => {
            console.log(`progress`);
          },
          true
        );
    }

    console.log(`Result of file upload: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.error("Error during file upload:", error);
    throw error;
  }
}

export async function getAllFilesInFolder(folderPath: string) {
  try {
    const sp = getSP();
    const folder: any = sp.web.getFolderByServerRelativePath(folderPath);

    const files = await folder.files();

    return files;
  } catch (error) {
    console.error("Error fetching files from folder:", error);
    throw error;
  }
}

export const getFileVersionHistory = async (fileUniqueId: string) => {
  try {
    // Make a direct REST API call to fetch file versions
    const sp = getSP();

    const versions = await sp.web.getFileById(fileUniqueId).versions();
    console.log(versions);

    // Transform the versions array to include necessary information for each version
    const versionHistory = versions.map((version: any) => ({
      versionNumber: version.VersionLabel,
      modifiedBy: version.CreatedBy ? version.CreatedBy.Name : "",
      modifiedDate: version.Created
        ? new Date(version.Created).toLocaleString().substring(0, 10)
        : "",
      modifiedTime: version.Created
        ? new Date(version.Created).toLocaleString().substring(12, 20)
        : "",
      size: version.Size,
    }));

    // Fetch the file to get the current version information
    const fileItem: any = await (
      await sp.web.getFileById(fileUniqueId).getItem()
    )
      .select("*")
      .expand("*");
    console.log(fileItem);

    // If file is found, add current version information to versionHistory
    if (fileItem) {
      versionHistory.push({
        versionNumber: fileItem.OData__UIVersionString,
        modifiedBy: fileItem.ModifiedBy ? fileItem.ModifiedBy.Name : "",
        modifiedDate: fileItem.Modified
          ? new Date(fileItem.Modified).toLocaleString().substring(0, 10)
          : "",
        modifiedTime: fileItem.Modified
          ? new Date(fileItem.Modified).toLocaleString().substring(12, 20)
          : "",
        size: fileItem.Length,
      });
    }

    return versionHistory;
  } catch (error) {
    console.error("Error fetching file version history:", error);
    throw error;
  }
};



// //Explanation
// // Import the getSP function from the pnpConfig module
// import { getSP } from "./pnpConfig";

// // Async function to upload a file to a specified folder in SharePoint
// export async function UploadFile(file: File, folderPath: string) {
//   try {
//     // Encode and decode the file name path for safe use in URLs
//     const fileNamePath: any = encodeURI(file.name);
//     const decodedFileNamePath = decodeURIComponent(fileNamePath);

//     // Get the SharePoint client context using the getSP function
//     const sp = getSP();
//     let result: any;

//     // Check if the file size is smaller than or equal to 10 MB for upload
//     if (file.size <= 10485760) {
//       // Small upload using the addUsingPath method
//       result = await sp.web
//         .getFolderByServerRelativePath(folderPath)
//         .files.addUsingPath(decodedFileNamePath, file, { Overwrite: true });
//     } else {
//       // Large upload using the addChunked method for handling large files
//       result = await sp.web
//         .getFolderByServerRelativePath(folderPath)
//         .files.addChunked(
//           decodedFileNamePath,
//           file,
//           (data) => {
//             console.log(`progress`);
//           },
//           true
//         );
//     }

//     // Log the result of the file upload
//     console.log(`Result of file upload: ${JSON.stringify(result)}`);
//     return result;
//   } catch (error) {
//     // Log and rethrow any errors that occur during the file upload
//     console.error("Error during file upload:", error);
//     throw error;
//   }
// }

// // Async function to get all files in a specified folder in SharePoint
// export async function getAllFilesInFolder(folderPath: string) {
//   try {
//     // Get the SharePoint client context using the getSP function
//     const sp = getSP();
//     const folder: any = sp.web.getFolderByServerRelativePath(folderPath);

//     // Retrieve all files in the folder using the files method
//     const files = await folder.files();

//     return files;
//   } catch (error) {
//     // Log and rethrow any errors that occur during fetching files
//     console.error("Error fetching files from folder:", error);
//     throw error;
//   }
// }

// // Async function to get the version history of a file in SharePoint
// export const getFileVersionHistory = async (fileUniqueId: string) => {
//   try {
//     // Get the SharePoint client context using the getSP function
//     const sp = getSP();

//     // Use a direct REST API call to fetch file versions
//     const versions = await sp.web.getFileById(fileUniqueId).versions();
//     console.log(versions);

//     // Transform the versions array to include necessary information for each version
//     const versionHistory = versions.map((version: any) => ({
//       versionNumber: version.VersionLabel,
//       modifiedBy: version.CreatedBy ? version.CreatedBy.Name : "",
//       modifiedDate: version.Created
//         ? new Date(version.Created).toLocaleString().substring(0, 10)
//         : "",
//       modifiedTime: version.Created
//         ? new Date(version.Created).toLocaleString().substring(12, 20)
//         : "",
//       size: version.Size,
//     }));

//     // Fetch the file to get the current version information
//     const fileItem: any = await (
//       await sp.web.getFileById(fileUniqueId).getItem()
//     )
//       .select("*")
//       .expand("*");
//     console.log(fileItem);

//     // If the file is found, add current version information to versionHistory
//     if (fileItem) {
//       versionHistory.push({
//         versionNumber: fileItem.OData__UIVersionString,
//         modifiedBy: fileItem.ModifiedBy ? fileItem.ModifiedBy.Name : "",
//         modifiedDate: fileItem.Modified
//           ? new Date(fileItem.Modified).toLocaleString().substring(0, 10)
//           : "",
//         modifiedTime: fileItem.Modified
//           ? new Date(fileItem.Modified).toLocaleString().substring(12, 20)
//           : "",
//         size: fileItem.Length,
//       });
//     }

//     return versionHistory;
//   } catch (error) {
//     // Log and rethrow any errors that occur during fetching file version history
//     console.error("Error fetching file version history:", error);
//     throw error;
//   }
// };
