package pl.pse.aero.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pse.aero.dto.UserRequest;
import pl.pse.aero.dto.UserResponse;
import pl.pse.aero.service.UserService;

import java.util.List;

@Tag(name = "Users", description = "User management (admin)")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "List users", description = "Returns all users sorted by email")
    @GetMapping
    public ResponseEntity<List<UserResponse>> list() {
        List<UserResponse> users = userService.findAll().stream()
                .map(UserResponse::from)
                .toList();
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(UserResponse.from(userService.findById(id)));
    }

    @Operation(summary = "Create user", description = "Password is required and stored as BCrypt hash")
    @ApiResponse(responseCode = "201", description = "User created")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserResponse.from(userService.create(request)));
    }

    @Operation(summary = "Update user", description = "Password is optional on update — only changed if provided")
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable String id,
                                               @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(UserResponse.from(userService.update(id, request)));
    }
}
