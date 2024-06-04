import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { cellToAxiosParamsSuspend, onSuspendSuccess, cellToAxiosParamsRestore, onRestoreSuccess } from "main/utils/usersUtils"
import * as useBackendModule from "main/utils/useBackend";
import { formatTime } from "main/utils/dateUtils";



const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

describe("UsersTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["id", "First Name", "Last Name", "Email", "Last Online", "Admin", "Suspended"];
  const expectedFields = ["id", "givenName", "familyName", "email", "lastOnline", "admin", "suspended"];

  test("renders empty table correctly", () => {

    const testId = "UsersTable";
    
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(fieldElement).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {

    const testId = "UsersTable";

    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-admin`)).toHaveTextContent("true");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-lastOnline`)).toHaveTextContent(formatTime(usersFixtures.threeUsers[0].lastOnline));
    expect(screen.getByTestId(`${testId}-cell-row-0-col-suspended`)).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-admin`)).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-suspended`)).toHaveTextContent("true");

    const suspendButton = screen.getByTestId(`${testId}-cell-row-0-col-Suspend-button`);
    expect(suspendButton).toBeInTheDocument();
    expect(suspendButton).toHaveClass("btn-danger");

    const restoreButton = screen.getByTestId(`${testId}-cell-row-0-col-Restore-button`);
    expect(restoreButton).toBeInTheDocument();
    expect(restoreButton).toHaveClass("btn-success");

  });

  test("Has the expected column headers, content for ordinary user", () => {
    // arrange
    const currentUser = currentUserFixtures.userOnly;

    const testId = "UsersTable";

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-admin`)).toHaveTextContent("true");
    expect(screen.getByTestId(`${testId}-cell-row-0-col-lastOnline`)).toHaveTextContent(formatTime(usersFixtures.threeUsers[0].lastOnline));
    expect(screen.getByTestId(`${testId}-cell-row-0-col-suspended`)).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-admin`)).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-suspended`)).toHaveTextContent("true");

    expect(screen.queryByText("Suspend")).not.toBeInTheDocument();
    expect(screen.queryByText("Restore")).not.toBeInTheDocument();
  });
});

describe("Button tests", () => {

    const queryClient = new QueryClient();

    // Mocking the delete mutation function
    const mockMutate = jest.fn();
    const mockUseBackendMutation = {
      mutate: mockMutate,
    };
  
    beforeEach(() => {
      jest.spyOn(useBackendModule, "useBackendMutation").mockReturnValue(mockUseBackendMutation);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("Suspend button calls suspend callback", async () => {
        // arrange
        const currentUser = currentUserFixtures.adminUser;

        const useBackendMutationSpy = jest.spyOn(useBackendModule, 'useBackendMutation');

        const testId = "UsersTable";
    
        // act - render the component
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter>
              <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
            </MemoryRouter>
          </QueryClientProvider>
        );
    
        const suspendButton = screen.getByTestId(`${testId}-cell-row-0-col-Suspend-button`);
        expect(suspendButton).toBeInTheDocument();
    
        fireEvent.click(suspendButton);
    
        await waitFor(() => {
            expect(useBackendMutationSpy).toHaveBeenCalledWith(
              cellToAxiosParamsSuspend,
              { onSuccess: onSuspendSuccess },
              ["/api/admin/users"]
            );
          });
      });

      test("Restore button calls restore callback", async () => {
        // arrange
        const currentUser = currentUserFixtures.adminUser;

        const useBackendMutationSpy = jest.spyOn(useBackendModule, 'useBackendMutation');

        const testId = "UsersTable";
    
        // act - render the component
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter>
              <UsersTable users={usersFixtures.threeUsers} currentUser={currentUser} />
            </MemoryRouter>
          </QueryClientProvider>
        );
    
        const restoreButton = screen.getByTestId(`${testId}-cell-row-0-col-Restore-button`);
        expect(restoreButton).toBeInTheDocument();
    
        fireEvent.click(restoreButton);
    
        await waitFor(() => {
            expect(useBackendMutationSpy).toHaveBeenCalledWith(
              cellToAxiosParamsRestore,
              { onSuccess: onRestoreSuccess },
              ["/api/admin/users"]
            );
          });
      });

});
