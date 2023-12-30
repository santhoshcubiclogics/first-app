import * as React from "react";
import { FontIcon, IStackTokens, Label, PrimaryButton, Stack, mergeStyleSets, DefaultButton, Spinner, SpinnerSize } from "@fluentui/react";
import readXlsxFile from "read-excel-file";
import { insertMultipleDataTolist } from "../../../../../../server/utils";
import Swal from "sweetalert2";
import Confetti from 'react-dom-confetti';
import "./ModalForm.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../tookit/store";

interface IModalFormInterface {
    onFinish: any;
}

const stackTokens: IStackTokens = { childrenGap: 2 }

const modalStyles = mergeStyleSets({
    container: {
        margin: 15
    },
    title: {
        fontSize: 15
    },
    description: {
        fontSize: 12,
        color: "gray"
    }
})

const centeredStyle = {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
}


const ModalForm: React.FunctionComponent<IModalFormInterface> = (props: IModalFormInterface) => {
    const fileinputref = React.useRef(null);
    const [selectedFile, setSelectedFile] = React.useState<any>("");
    const [isFileUploading, setIsFileUploading] = React.useState<boolean>(false);
    const divRef = React.useRef(null);
    const store_data = useSelector((state:RootState) => state.usrReg)

    const handleFileChange = (event: any) => {
        setSelectedFile(event.target.files[0])
    }

    const hanldeFileUpload = () => {
        fileinputref.current.click()
    }
    const shakeDiv = () => {
        divRef.current.classList.add('shake');
        setTimeout(() => {
            divRef.current.classList.remove('shake');
        }, 1000);
    };
    const handleUploadFile = async () => {
        if (selectedFile["name"]) {
            setIsFileUploading(true)
            const fileData = await readXlsxFile(selectedFile);
            insertMultipleDataTolist(store_data.list_name, fileData).then((res: any) => {
                setIsFileUploading(false);
                if (res.code == 200) {
                    Swal.fire({
                        title: 'Success',
                        text: 'Bulk upload success',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    })
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Unable to upload users',
                        icon: 'error',
                        confirmButtonText: 'Close'
                    })
                }
            }).then(() => {
                props.onFinish()
            })
        } else {
            shakeDiv()
        }
    }

    const config = {
        angle: 90,
        spread: 360,
        startVelocity: 40,
        elementCount: 70,
        dragFriction: 0.12,
        duration: 1000,
        stagger: 3,
        width: '10px',
        height: '10px',
        colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
    };
    return (
        <div className={modalStyles.container}>
            <Stack tokens={stackTokens}>
                <Label className={modalStyles.title}>Bulk Upload</Label>
                <Label className={modalStyles.description}>Select an excel file to upload user data</Label>
                <div ref={divRef} className="shake-div">
                    <FontIcon style={{
                        ...centeredStyle,
                        fontSize: "30px",
                        margin: "22px 0px 0px 0px"
                    }}
                        aria-label="Folder" iconName="CloudUpload" />
                    <input accept=".xlsx" type="file" style={{ display: "none" }} onChange={handleFileChange} ref={fileinputref} />
                    <p style={{ ...centeredStyle,cursor: "pointer" }} onClick={hanldeFileUpload}>Choose file</p>
                    <Confetti active={divRef.current && divRef.current.classList.contains('shake')} config={config} />
                </div>
                <Label style={{
                    ...centeredStyle,
                    color: "blue",
                    textDecoration: "underline"
                }}>{selectedFile["name"] ? selectedFile["name"] : ""}</Label>
                <Stack tokens={{ childrenGap: 10 }}>
                    <PrimaryButton onClick={handleUploadFile}>{isFileUploading ? <Spinner size={SpinnerSize.small} /> : "Upload"}</PrimaryButton>
                    <DefaultButton onClick={() => props.onFinish()}>Cancel</DefaultButton>
                </Stack>
            </Stack>
        </div>
    )
}
export default ModalForm;
