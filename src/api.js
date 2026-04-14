const API_BASE_URL = 'http://localhost:5000/api';

export const deleteCourse = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete course');
    return data;
};

export const deleteQuestion = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/exams/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete question');
    return data;
};

export const deleteSubject = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete subject');
    return data;
};

export const login = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
};

export const register = async (userData) => {
    const isFormData = userData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? userData : JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
};

export const fetchProfile = async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Profile fetch failed');
    return data;
};

// Course Services
export const getCourses = async (token) => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch courses');
    return data;
};

export const createCourse = async (courseData, token) => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(courseData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create course');
    return data;
};

// Subject Services
export const getSubjects = async (token) => {
    const response = await fetch(`${API_BASE_URL}/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch subjects');
    return data;
};

export const createSubject = async (subjectData, token) => {
    const response = await fetch(`${API_BASE_URL}/subjects`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(subjectData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create subject');
    return data;
};

// Exam Services
export const getExams = async (token) => {
    const response = await fetch(`${API_BASE_URL}/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch exams');
    return data;
};

export const createExam = async (examData, token) => {
    const response = await fetch(`${API_BASE_URL}/exams`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(examData)
    });
    const data = await response.json();
    return data;
};

export const getUsers = async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
    return data;
};

export const registerFace = async (formData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register-face`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Biometric identity matching failed');
        return data;
    } catch (err) {
        console.error('API registerFace Error:', err);
        throw err;
    }
};

export const getExamById = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch exam');
    return data;
};

export const getExamQuestions = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/exams/${id}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch questions');
    return data;
};


export const submitExam = async (examId, answers, token) => {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ examId, answers })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to submit exam');
    return data;
};

export const getMyResults = async (token) => {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch results');
    return data;
};

export const getResultById = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch result details');
    return data;
};

export const getAllSubmissions = async (token) => {
    const response = await fetch(`${API_BASE_URL}/submissions/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch all submissions');
    return data;
};

export const getProctorLogs = async (token) => {
    const response = await fetch(`${API_BASE_URL}/submissions/proctor-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch proctor logs');
    return data;
};

export const getQuestions = async (token) => {
    const response = await fetch(`${API_BASE_URL}/exams/questions/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch questions');
    return data;
};

export const createQuestion = async (qData, token) => {
    const { examId, ...rest } = qData;
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(rest)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create question');
    return data;
};

export const getDashboardStats = async (token) => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch stats');
    return data;
};

export const deleteUser = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete user');
    return data;
};

export const deleteExam = async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete exam');
    return data;
};
