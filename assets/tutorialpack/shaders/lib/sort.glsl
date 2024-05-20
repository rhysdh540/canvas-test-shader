//NOTE: all algorithms must sort in descending order

// Batcher's odd-even merge sort
void batcherSort6(inout Pair arr[6]) {
    compareAndSwap(0, 1, arr);
    compareAndSwap(2, 3, arr);
    compareAndSwap(4, 5, arr);
    compareAndSwap(0, 2, arr);
    compareAndSwap(1, 3, arr);
    compareAndSwap(0, 4, arr);
    compareAndSwap(1, 5, arr);
    compareAndSwap(2, 4, arr);
    compareAndSwap(3, 5, arr);
    compareAndSwap(1, 2, arr);
    compareAndSwap(3, 4, arr);
    compareAndSwap(1, 4, arr);
    compareAndSwap(3, 2, arr);
    compareAndSwap(2, 4, arr);
    compareAndSwap(1, 3, arr);
}

// Insertion sort
void insertionSort6(inout Pair arr[6]) {
    for(int i = 1; i < 6; i++) {
        Pair key = arr[i];
        int j = i - 1;
        while(j >= 0 && arr[j].depth < key.depth) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

// Selection sort
void selectionSort6(inout Pair arr[6]) {
    for(int i = 0; i < 6; i++) {
        int max = i;
        for(int j = i + 1; j < 6; j++) {
            if(arr[j].depth > arr[max].depth) {
                max = j;
            }
        }
        if(max != i) {
            swap(i, max, arr);
        }
    }
}

// Bubble sort
void bubbleSort6(inout Pair arr[6]) {
    for(int i = 0; i < 6; i++) {
        for(int j = 0; j < 6 - i - 1; j++) {
            if(arr[j].depth < arr[j + 1].depth) {
                swap(j, j + 1, arr);
            }
        }
    }
}

void sort(inout Pair arr[6]) {
//    insertionSort6(arr); // 0.4-.5
//    selectionSort6(arr); // 1.5
//    bubbleSort6(arr); // 2.5
//    batcherSort6(arr); // 0.4-.5
    networkSort6(arr); // 0.4-.5
}