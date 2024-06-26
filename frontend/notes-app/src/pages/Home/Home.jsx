import Navbar from "../../components/Navbar/Navbar.jsx";
import NoteCard from "../../Cards/NoteCard.jsx";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes.jsx";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import Toast from "../../ToastMessage/Toast.jsx";
import EmptyCard from "../../Cards/EmptyCard.jsx";
import AddNotesImg from "../../assets/add-note.svg";
import NoDataImg from "../../assets/no-data.svg";
import Spinner from "../../components/Loading/Spinner.jsx";

const Home = () => {
    const [openAddEditModal, setOpenAddEditModal] = useState({
        isShown: false,
        type: "add",
        data: null,
    });

    const [showToastMsg, setShowToastMsg] = useState({
        isShown: false,
        message: "",
        type: "add",
    });

    const [userInfo, setUserInfo] = useState([]);
    const [allNotes, setAllNotes] = useState([]);
    const [isSearch, setIsSearch] = useState(false);

    const [isFirstTime, setIsFirstTime] = useState(true);
    const [isLoading, setIsLoading] = useState(false);



    const navigate = useNavigate();

    const handleEdit = (noteDetails) => {
        setOpenAddEditModal({
            isShown: true,
            data: noteDetails,
            type: "edit",
        });
    };

    const showToastMessage = (message, type) => {
        setShowToastMsg({
            isShown: true,
            message,
            type,
        });
    };

    const handleCloseToast = () => {
        setShowToastMsg({
            isShown: false,
            message: "",
        });
    };

    // GET user info
    const getUserInfo = async () => {
        try {
            const response = await axiosInstance.get("/get-user");
            if (response.data && response.data.user) {
                setUserInfo(response.data.user);
            }
        } catch (error) {
            if (error.response.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
        }
    };

    // Get all notes
    const getAllNotes = async () => {
        if (isFirstTime){
            setIsLoading(true);
        }

        try {
            const response = await axiosInstance.get("/get-all-notes");
            setAllNotes(response.data.notes);
        } catch (error) {
            console.log("An unexpected error occurred");
        } finally {
            if (isFirstTime) {
                setIsLoading(false);
                setIsFirstTime(false);
            }
        }
    };

    // Delete note
    const deleteNote = async (data) => {
        const noteId = data._id;

        try {
            const response = await axiosInstance.delete("/delete-note/" + noteId, data);

            if (response.data && !response.data.error) {
                showToastMessage("Note Deleted Successfully", "delete");
                getAllNotes();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                console.log(error.response.data.message);
            }
        }
    };

    // Search for a note
    const onSearchNote = async (query) => {
        try {
            const response = await axiosInstance.get("/search-notes", {
                params: { query },
            });

            if (response.data && response.data.notes) {
                setIsSearch(true);
                setAllNotes(response.data.notes);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleClearSearch = () => {
        setIsSearch(false);
        getAllNotes();
    };

    const updateIsPinned = async (noteData) => {
        const noteId = noteData._id;

        try {
            const response = await axiosInstance.put("/update-note/" + noteId, {
                isPinned: !noteData.isPinned,
            });

            if (response.data && response.data.note) {
                showToastMessage("Note Updated Successfully");
                getAllNotes();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                console.log(error.response.data.message);
            }
        }
    };

    useEffect(() => {
        getAllNotes();
        getUserInfo();
        return () => {};
    }, []);

    return (
        <>
            <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} />
            <div className="container mx-auto">
                {isLoading ? (
                    <Spinner />  // Show spinner during initial load
                ) : (
                    <>
                        {allNotes.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4 mt-8">
                                {allNotes.map((item) => (
                                    <NoteCard
                                        key={item._id}
                                        title={item.title}
                                        date={item.createdOn}
                                        content={item.content}
                                        tags={item.tags}
                                        isPinned={item.isPinned}
                                        onEdit={() => handleEdit(item)}
                                        onDelete={() => deleteNote(item)}
                                        onPinNote={() => updateIsPinned(item)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyCard
                                imSrc={isSearch ? NoDataImg : AddNotesImg}
                                message={
                                    isSearch
                                        ? `Oops! No notes found matching your search.`
                                        : `Start creating your first note! Click 'Add' button to jot down your thoughts, ideas, and reminders. Let's get started!`
                                }
                            />
                        )}
                    </>
                )}
            </div>

            <button
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 fixed right-6 bottom-8"
                onClick={() => {
                    setOpenAddEditModal({ isShown: true, type: "add", data: null });
                }}
            >
                <MdAdd className="text-[32px] text-white" />
            </button>

            <Modal
                isOpen={openAddEditModal.isShown}
                onRequestClose={() => {}}
                style={{
                    overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                    },
                    content: {
                        overflowY: "auto",
                    },
                }}
                contentLabel=""
                className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
            >
                <AddEditNotes
                    noteData={openAddEditModal.data}
                    type={openAddEditModal.type}
                    onClose={() => {
                        setOpenAddEditModal({
                            isShown: false,
                            type: "add",
                            data: null,
                        });
                    }}
                    getAllNotes={getAllNotes}
                    showToastMessage={showToastMessage}
                />
            </Modal>

            <Toast
                isShown={showToastMsg.isShown}
                message={showToastMsg.message}
                type={showToastMsg.type}
                onClose={handleCloseToast}
            />
        </>
    );
};

export default Home;
