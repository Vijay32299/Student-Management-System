package com.example.studentapi.service;

import com.example.studentapi.entity.Student;
import com.example.studentapi.repository.StudentRepository;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    // Add Student
    public Student addStudent(Student student) {
        return repository.save(student);
    }

    // Get All Students
    public List<Student> getAllStudents() {
        return repository.findAll();
    }

    // Get Student By ID
    public Student getStudentById(int id) {
        return repository.findById(id).orElse(null);
    }

    // Update Student
    public Student updateStudent(int id, Student student) {

        Student existing = repository.findById(id).orElse(null);

        if (existing != null) {
            existing.setName(student.getName());
            existing.setEmail(student.getEmail());
            existing.setCourse(student.getCourse());

            return repository.save(existing);
        }

        return null;
    }

    // Delete Student
    public void deleteStudent(int id) {
        repository.deleteById(id);
    }
}
